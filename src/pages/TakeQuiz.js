import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    // Get user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);

    // Load quiz from localStorage
    const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    let selectedQuiz = allQuizzes.find(q => q.id === parseInt(id) || q.id === id);
    
    if (selectedQuiz) {
      // Ensure quiz type consistency
      if (selectedQuiz.category) {
        // Make sure each question has the type matching the quiz category
        selectedQuiz = {
          ...selectedQuiz,
          questions: selectedQuiz.questions.map(q => ({
            ...q,
            type: selectedQuiz.category,
            // Ensure appropriate data structures based on question type
            options: selectedQuiz.category === 'multiple-choice' ? (q.options?.length ? q.options : ['', '', '', '']) : [],
            matchingPairs: selectedQuiz.category === 'matching' ? 
              (q.matchingPairs?.length ? q.matchingPairs : [{ left: '', right: '' }]) : [],
            correctAnswer: selectedQuiz.category === 'true-false' ? 
              (q.correctAnswer || 'true') : 
              selectedQuiz.category === 'short-answer' ? 
                (q.correctAnswer || '') : 
                (q.correctAnswer ?? 0)
          }))
        };
      }
      
      // For students, verify that the quiz is published
      if (userData.role === 'student' && !selectedQuiz.isPublished) {
        setError('This quiz is not available for students');
        setLoading(false);
        return;
      }

      // For teachers, verify they own the quiz or it's published
      if (userData.role === 'teacher' && 
          selectedQuiz.createdBy !== userData.id && 
          !selectedQuiz.isPublished) {
        setError('You do not have access to this quiz');
        setLoading(false);
        return;
      }
      
      console.log('Loaded quiz:', selectedQuiz); // Debug log
      setQuiz(selectedQuiz);

      // Check if access code is required
      if (userData.role === 'student' && selectedQuiz.accessCode) {
        setIsCodeVerified(false);
      } else {
        setIsCodeVerified(true);
      }
      
      // Initialize answers object
      const initialAnswers = {};
      selectedQuiz.questions.forEach((_, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
      
      // Set timer if time limit exists
      if (selectedQuiz.timeLimit > 0) {
        setTimeLeft(selectedQuiz.timeLimit * 60); // Convert minutes to seconds
      }
    } else {
      setError('Quiz not found');
    }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    let timer;
    if (isCodeVerified && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isCodeVerified]);

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points || 1;
      if (question.type === 'multiple-choice') {
        if (parseInt(answers[index]) === question.correctAnswer) {
          score += question.points || 1;
        }
      } else if (question.type === 'true-false') {
        if (answers[index] === (question.correctAnswer != null ? question.correctAnswer.toString() : '')) {
          score += question.points || 1;
        }
      } else if (question.type === 'short-answer') {
        // Simple scoring for short answer questions based on keyword matching
        const userAnswer = answers[index] ? answers[index].toLowerCase().trim() : '';
        const correctAnswer = question.correctAnswer ? question.correctAnswer.toLowerCase().trim() : '';
        
        // If the student's answer contains the key terms from the correct answer, award points
        if (userAnswer.includes(correctAnswer) && userAnswer.length > 0 && correctAnswer.length > 0) {
          score += question.points || 1;
        }
      } else if (question.type === 'matching') {
        // Implement matching scoring logic
        // Calculate how many pairs are correctly matched
        const userMatches = answers[index] || {};
        let correctMatches = 0;
        let totalPairs = question.matchingPairs.length;
        
        // For each pair the user matched
        Object.keys(userMatches).forEach(leftIndex => {
          const rightIndex = userMatches[leftIndex];
          if (rightIndex !== '') {
            // If user selected the right match
            if (question.matchingPairs[parseInt(leftIndex)].right === 
                question.matchingPairs[parseInt(rightIndex)].right) {
              correctMatches++;
            }
          }
        });
        
        // Award partial or full points based on correctness
        if (correctMatches > 0) {
          const partialScore = ((correctMatches / totalPairs) * (question.points || 1));
          score += partialScore;
        }
      }
      // Add more scoring logic for other question types
    });

    // Normalize score to 10-point scale
    const normalizedScore = Math.round((score / totalPoints) * 10);

    try {
      // Save directly to localStorage (fully serverless)
      const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
      results.push({
        id: Date.now(),
        userId: user.id,
        quizId: quiz._id || quiz.id,
        quizTitle: quiz.title,
        score: normalizedScore,
        totalScore: score,
        totalPoints,
        completedAt: new Date().toISOString(),
        answers
      });
      localStorage.setItem('quizResults', JSON.stringify(results));

      // Navigate to results page
      navigate(`/quiz-results/${quiz._id || quiz.id}`);
    } catch (error) {
      console.error('Error saving quiz result:', error);
      alert(`Error saving quiz result: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/quiz-list')}
          sx={{ mt: 2 }}
        >
          Back to Quiz List
        </Button>
      </Container>
    );
  }

  if (!quiz) return null;

  if (!isCodeVerified && user?.role === 'student' && quiz.accessCode) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper 
          elevation={3} 
          className="glass-panel" 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            color: 'inherit', 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Enter Access Code
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
              This quiz ("{quiz.title}") requires an access code to start. Please enter the 6-character code provided by your teacher.
            </Typography>
            {codeError && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {codeError}
              </Alert>
            )}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="e.g. AB12CD"
              value={accessCodeInput}
              onChange={(e) => {
                setAccessCodeInput(e.target.value.toUpperCase());
                setCodeError('');
              }}
              inputProps={{ 
                maxLength: 6,
                style: { textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 'bold' } 
              }}
              sx={{ mb: 3 }}
              autoFocus
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                if (accessCodeInput.trim() === quiz.accessCode.toUpperCase()) {
                  setIsCodeVerified(true);
                } else {
                  setCodeError('Invalid access code. Please try again.');
                }
              }}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
                color: 'white',
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)',
                }
              }}
            >
              Verify & Start Quiz
            </Button>
          </Box>
          <Button
            variant="text"
            onClick={() => navigate('/quiz-list')}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
        </Paper>
      </Container>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} className="glass-panel" sx={{ p: 4, color: 'inherit', borderRadius: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {quiz.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {quiz.description}
          </Typography>
          {timeLeft !== null && (
            <Typography variant="h6" sx={{ color: '#ec4899', fontWeight: 'bold' }}>
              Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
          )}
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            mb: 4, 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #2563eb 0%, #0d9488 100%)',
            }
          }}
        />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Typography>
          <Typography variant="body1" paragraph>
            {question.question}
          </Typography>

          {question.type === 'multiple-choice' && (
            <FormControl component="fieldset">
              <RadioGroup
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(e.target.value)}
              >
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index.toString()}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {question.type === 'true-false' && (
            <FormControl component="fieldset">
              <RadioGroup
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(e.target.value)}
              >
                <FormControlLabel value="true" control={<Radio />} label="True" />
                <FormControlLabel value="false" control={<Radio />} label="False" />
              </RadioGroup>
            </FormControl>
          )}

          {question.type === 'short-answer' && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Write your answer in the box below. Be clear and concise.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={answers[currentQuestion]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.15)',
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <Box sx={{ 
                      position: 'absolute', 
                      right: 8, 
                      bottom: 8, 
                      color: 'text.secondary',
                      fontSize: '0.75rem' 
                    }}>
                      {answers[currentQuestion]?.length || 0} characters
                    </Box>
                  ),
                }}
              />
            </Box>
          )}

          {question.type === 'matching' && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Match the items on the left with the corresponding items on the right.
              </Typography>
              {question.matchingPairs && (
                <Box>
                  {/* Create a state for the user's matching answers if it doesn't exist */}
                  {!answers[currentQuestion] && (() => {
                    const initialMatchingAnswers = {};
                    question.matchingPairs.forEach((pair, idx) => {
                      initialMatchingAnswers[idx] = '';
                    });
                    handleAnswerChange(initialMatchingAnswers);
                    return null;
                  })()}
                  
                  {/* Display all left items with dropdown selections for right items */}
                  {question.matchingPairs.map((pair, leftIndex) => (
                    <Box key={leftIndex} sx={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       mb: 2,
                       p: 2,
                       borderRadius: 1,
                       backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }}>
                      {/* Left item */}
                      <Box sx={{ 
                        flex: 1, 
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        mr: 2
                      }}>
                        <Typography variant="body1">{pair.left}</Typography>
                      </Box>
                      
                      {/* Selection for right item */}
                      <FormControl sx={{ flex: 1 }}>
                        <RadioGroup
                          value={answers[currentQuestion]?.[leftIndex] || ''}
                          onChange={(e) => {
                            const newMatchingAnswers = {
                              ...(answers[currentQuestion] || {})
                            };
                            // Remove this right answer from any other left item
                            Object.keys(newMatchingAnswers).forEach(key => {
                              if (newMatchingAnswers[key] === e.target.value) {
                                newMatchingAnswers[key] = '';
                              }
                            });
                            // Set the new matching
                            newMatchingAnswers[leftIndex] = e.target.value;
                            handleAnswerChange(newMatchingAnswers);
                          }}
                        >
                          {question.matchingPairs.map((rightChoice, rightIndex) => (
                            <FormControlLabel
                              key={rightIndex}
                              value={rightIndex.toString()}
                              control={<Radio />}
                              label={rightChoice.right}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            sx={{
              color: 'inherit',
              borderColor: 'rgba(0,0,0,0.2)',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(0,0,0,0.04)',
              },
              '&.Mui-disabled': {
                color: 'rgba(0,0,0,0.26)',
                borderColor: 'rgba(0,0,0,0.12)',
              }
            }}
          >
            Previous
          </Button>
          {currentQuestion < quiz.questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              className="gradient-btn"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              className="gradient-btn pulse-glow"
            >
              Submit Quiz
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default TakeQuiz; 