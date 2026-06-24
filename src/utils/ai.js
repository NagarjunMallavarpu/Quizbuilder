/**
 * Queries Hugging Face Inference API to generate a helpful insight/tip
 * for a question a student answered incorrectly.
 */
export async function fetchAIInsight(questionText, userAnswerText, correctAnswerText, category, token) {
  const activeToken = token || import.meta.env.VITE_HF_TOKEN;
  if (!activeToken) {
    return generateFallbackInsight(questionText, userAnswerText, correctAnswerText, category);
  }

  const prompt = `You are a helpful educational AI tutor. A student got this question wrong:
Question: "${questionText}"
Student's Answer: "${userAnswerText}"
Correct Answer: "${correctAnswerText}"
Quiz Category: ${category || 'general'}

Provide a very concise (2 to 3 sentences), encouraging, and clear explanation of why the correct answer is correct and a key concept to remember. Be direct and do not use greeting phrases.`;

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeToken}`
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 180,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Invalid response format from Hugging Face Inference API");
    }
  } catch (error) {
    console.warn("Hugging Face API request failed, using offline fallback:", error);
    return generateFallbackInsight(questionText, userAnswerText, correctAnswerText, category) + 
      "\n\n(Study Tip: Hugging Face API is currently unavailable or token is invalid/missing. Please check your token settings to enable live AI tutor feedback.)";
  }
}

function generateFallbackInsight(questionText, userAnswerText, correctAnswerText, category) {
  const catName = category ? category.replace('-', ' ') : 'general studies';
  return `Let's review this concept: The question asks "${questionText}". Your answer was "${userAnswerText || 'none'}", but the correct answer is "${correctAnswerText}". Make sure to review study materials related to "${catName}" and focus on understanding the definitions and key properties that distinguish "${correctAnswerText}" from other choices.`;
}

/**
 * Queries Hugging Face Inference API to generate a complete quiz based on a topic and type.
 */
export async function generateAIQuizContent(topic, category, numQuestions, token) {
  const activeToken = token || import.meta.env.VITE_HF_TOKEN;
  if (!activeToken) {
    throw new Error("Hugging Face API token is required to generate quizzes using AI. Please enter a valid token in settings.");
  }

  let jsonFormatInstructions = "";
  if (category === 'multiple-choice') {
    jsonFormatInstructions = `
{
  "title": "A short, engaging title for the quiz",
  "description": "A brief description of what the quiz covers",
  "timeLimit": 10,
  "questions": [
    {
      "question": "The question text?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": 0
    }
  ]
}
Note: 'correctAnswer' must be the index (0 to 3) of the correct option in the options array. Exactly 4 options must be provided for each question.`;
  } else if (category === 'true-false') {
    jsonFormatInstructions = `
{
  "title": "A short, engaging title for the quiz",
  "description": "A brief description of what the quiz covers",
  "timeLimit": 10,
  "questions": [
    {
      "question": "The question statement?",
      "correctAnswer": "true"
    }
  ]
}
Note: 'correctAnswer' must be a string: either "true" or "false" in lowercase.`;
  } else if (category === 'short-answer') {
    jsonFormatInstructions = `
{
  "title": "A short, engaging title for the quiz",
  "description": "A brief description of what the quiz covers",
  "timeLimit": 10,
  "questions": [
    {
      "question": "The question statement?",
      "correctAnswer": "The exact correct answer or key terms that must be present"
    }
  ]
}
Note: 'correctAnswer' should be a concise answer or list of key terms (1-5 words).`;
  } else if (category === 'matching') {
    jsonFormatInstructions = `
{
  "title": "A short, engaging title for the quiz",
  "description": "A brief description of what the quiz covers",
  "timeLimit": 10,
  "questions": [
    {
      "question": "Match the terms on the left with their correct definitions on the right:",
      "matchingPairs": [
        {"left": "Term 1", "right": "Definition/Match 1"},
        {"left": "Term 2", "right": "Definition/Match 2"},
        {"left": "Term 3", "right": "Definition/Match 3"}
      ]
    }
  ]
}
Note: Each matching question should have a 'matchingPairs' array containing 3 to 5 pairs.`;
  }

  const prompt = `You are an educational quiz generation assistant.
Generate a complete, high-quality, professional quiz based on the following:
Topic: "${topic}"
Category/Type: "${category}"
Number of Questions: ${numQuestions}

You MUST respond ONLY with a single JSON object. Do not include any introductory or concluding text, explanation, or markdown code block wrapper (like \`\`\`json). Just the raw JSON.
The JSON must adhere to this structure:
${jsonFormatInstructions}

Make sure the questions cover diverse aspects of the topic "${topic}" suitable for a student. Double check that correct answers are accurate.`;

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${activeToken}`
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      let content = data.choices[0].message.content.trim();
      
      // Clean up markdown code block if model included it
      if (content.startsWith("```")) {
        content = content.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "").trim();
      }
      
      try {
        const parsedQuiz = JSON.parse(content);
        
        // Post-process to ensure valid fields
        parsedQuiz.category = category;
        if (!parsedQuiz.questions || !Array.isArray(parsedQuiz.questions)) {
          throw new Error("Quiz is missing questions array.");
        }
        
        // Ensure each question matches expected format
        parsedQuiz.questions = parsedQuiz.questions.map(q => {
          const type = category;
          return {
            ...q,
            type,
            points: q.points || 1,
            options: type === 'multiple-choice' ? (q.options || ['', '', '', '']) : [],
            matchingPairs: type === 'matching' ? (q.matchingPairs || [{ left: '', right: '' }]) : [],
            correctAnswer: type === 'true-false' ? 
              (q.correctAnswer ? q.correctAnswer.toString().toLowerCase() : 'true') : 
              type === 'short-answer' ? 
                (q.correctAnswer || '') : 
                (q.correctAnswer !== undefined ? parseInt(q.correctAnswer) : 0)
          };
        });
        
        return parsedQuiz;
      } catch (parseError) {
        console.error("Failed to parse AI response content as JSON:", content);
        throw new Error("AI did not return a valid JSON quiz structure. Please try again.");
      }
    } else {
      throw new Error("Invalid response format from Hugging Face Inference API");
    }
  } catch (error) {
    console.error("AI quiz generation failed:", error);
    throw error;
  }
}
