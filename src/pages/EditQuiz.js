import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { quizDb } from '../utils/supabaseClient';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const DecorativeBackground = () => null;

// Decorative section component
const DecorativeSection = ({ children, title, icon }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      mb: 3,
      bgcolor: 'background.paper',
      borderLeft: '6px solid #2563eb',
      borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      borderRight: '1px solid rgba(0, 0, 0, 0.06)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      color: 'text.primary',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '8px',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold', color: 'text.primary' }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

function EditQuiz() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuiz = async () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) {
        navigate('/login');
        return;
      }

      try {
        const quiz = await quizDb.getQuizById(id);
        if (!quiz) {
          setError('Quiz not found');
          return;
        }

        if (String(quiz.createdBy) !== String(userData.id)) {
          setError('You do not have permission to edit this quiz');
          return;
        }

        // Ensure accessCode exists
        if (!quiz.accessCode) {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let code = '';
          for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          quiz.accessCode = code;
        }

        setQuizData(quiz);
      } catch (err) {
        setError('Error loading quiz: ' + err.message);
      }
    };

    loadQuiz();
  }, [id, navigate]);

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    
    // If category is changed, update all question types
    if (name === 'category') {
      setQuizData((prev) => {
        const updatedQuestions = prev.questions.map(q => {
          let updatedQuestion = {
            ...q,
            type: value
          };
          
          // Add default properties based on question type
          if (value === 'multiple-choice') {
            updatedQuestion.options = q.options?.length ? q.options : ['', '', '', ''];
            updatedQuestion.correctAnswer = 0;
          } else if (value === 'true-false') {
            updatedQuestion.options = [];
            updatedQuestion.correctAnswer = 'true';
          } else if (value === 'short-answer') {
            updatedQuestion.options = [];
            updatedQuestion.correctAnswer = '';
          } else if (value === 'matching') {
            updatedQuestion.options = [];
            updatedQuestion.matchingPairs = q.matchingPairs?.length 
              ? q.matchingPairs 
              : [{ left: '', right: '' }];
          }
          
          return updatedQuestion;
        });
        
        return {
          ...prev,
          [name]: value,
          questions: updatedQuestions
        };
      });
    } else {
      setQuizData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value,
      };
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options[optionIndex] = value;
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const handleMatchingPairChange = (questionIndex, pairIndex, field, value) => {
    setQuizData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].matchingPairs[pairIndex][field] = value;
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      type: quizData.category,
      options: quizData.category === 'multiple-choice' ? ['', '', '', ''] : [],
      correctAnswer: quizData.category === 'true-false' ? 'true' : 
                    quizData.category === 'short-answer' ? '' : 0,
      matchingPairs: quizData.category === 'matching' ? [{ left: '', right: '' }] : [],
    };

    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const addMatchingPair = (questionIndex) => {
    setQuizData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].matchingPairs.push({ left: '', right: '' });
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const removeMatchingPair = (questionIndex, pairIndex) => {
    setQuizData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].matchingPairs = newQuestions[questionIndex].matchingPairs.filter((_, i) => i !== pairIndex);
      return {
        ...prev,
        questions: newQuestions,
      };
    });
  };

  const removeQuestion = (index) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const getButtonColor = () => {
    switch (quizData.category) {
      case 'multiple-choice':
        return '#3498DB';
      case 'true-false':
        return '#2ECC71';
      case 'short-answer':
        return '#E67E22';
      case 'matching':
        return '#9B59B6';
      default:
        return '#2ECC71';
    }
  };

  const getButtonHoverColor = () => {
    switch (quizData.category) {
      case 'multiple-choice':
        return '#2980B9';
      case 'true-false':
        return '#27AE60';
      case 'short-answer':
        return '#D35400';
      case 'matching':
        return '#8E44AD';
      default:
        return '#27AE60';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quizData.title || !quizData.description || !quizData.category) {
      alert('Please fill in all quiz details');
      return;
    }

    const isIncomplete = quizData.questions.some((q) => {
      if (!q.question) return true;
      
      if (q.type === 'matching') {
        return (q.matchingPairs || []).some(pair => !pair.left || !pair.right);
      } else if (q.type === 'multiple-choice') {
        return (q.options || []).some(opt => !opt);
      } else if (q.type === 'short-answer') {
        return !q.correctAnswer;
      }
      
      return false;
    });

    if (isIncomplete) {
      alert('Please fill in all questions and options');
      return;
    }

    try {
      await quizDb.updateQuiz(quizData.id, quizData);
      alert('Quiz updated successfully!');
      navigate('/quiz-list');
    } catch (err) {
      alert('Failed to update quiz: ' + err.message);
    }
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/quiz-list')}>
          Back to Quiz List
        </Button>
      </Container>
    );
  }

  if (!quizData) {
    return null;
  }

  const renderQuestionOptions = (question, questionIndex) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <Box>
            {(question.options || []).map((option, optionIndex) => (
              <Box key={optionIndex} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                  required
                />
              </Box>
            ))}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Correct Answer</InputLabel>
              <Select
                value={question.correctAnswer}
                onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
              >
                {(question.options || []).map((_, index) => (
                  <MenuItem key={index} value={index}>
                    Option {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 'true-false':
        return (
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend" sx={{ color: 'text.secondary', fontWeight: '500' }}>Correct Answer</FormLabel>
            <RadioGroup
              value={question.correctAnswer}
              onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
              row
            >
              <FormControlLabel
                value="true"
                control={<Radio color="primary" />}
                label="True"
                sx={{ color: 'text.primary' }}
              />
              <FormControlLabel
                value="false"
                control={<Radio color="primary" />}
                label="False"
                sx={{ color: 'text.primary' }}
              />
            </RadioGroup>
          </FormControl>
        );

      case 'short-answer':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the key terms or exact answer students should provide. The system will use this to check if the student's answer contains these terms.
            </Typography>
            <TextField
              fullWidth
              label="Expected Keywords/Answer"
              value={question.correctAnswer}
              onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
              required
              helperText="Enter the most important keywords or the exact answer you expect"
              sx={{ mt: 2 }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              Note: For more complex answers, you'll need to manually review student responses later.
            </Typography>
          </Box>
        );

      case 'matching':
        return (
          <Box>
            {question.matchingPairs.map((pair, pairIndex) => (
              <Box key={pairIndex} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label={`Left Item ${pairIndex + 1}`}
                  value={pair.left}
                  onChange={(e) => handleMatchingPairChange(questionIndex, pairIndex, 'left', e.target.value)}
                  required
                />
                <DragIndicatorIcon sx={{ color: 'action.active' }} />
                <TextField
                  fullWidth
                  label={`Right Item ${pairIndex + 1}`}
                  value={pair.right}
                  onChange={(e) => handleMatchingPairChange(questionIndex, pairIndex, 'right', e.target.value)}
                  required
                />
                <IconButton
                  onClick={() => removeMatchingPair(questionIndex, pairIndex)}
                  sx={{ color: '#E74C3C' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => addMatchingPair(questionIndex)}
              sx={{
                mt: 2,
                color: getButtonColor(),
                borderColor: getButtonColor(),
                '&:hover': {
                  borderColor: getButtonHoverColor(),
                  backgroundColor: `${getButtonColor()}1A`
                }
              }}
            >
              Add Matching Pair
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
      <DecorativeBackground />
      
      <Box 
        sx={{ 
          mb: 4,
          textAlign: 'center',
          background: 'linear-gradient(45deg, #2C3E50 30%, #34495E 90%)',
          borderRadius: 3,
          p: 4,
          color: 'white',
          boxShadow: '0 8px 16px rgba(44, 62, 80, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Edit {quizData.category.charAt(0).toUpperCase() + quizData.category.slice(1)} Quiz
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Modify your quiz questions and settings
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <DecorativeSection 
          title="Quiz Details" 
          icon={<QuizIcon sx={{ fontSize: 30, color: '#3498DB' }} />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quiz Title"
                name="title"
                value={quizData.title}
                onChange={handleQuizChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'rgba(52, 152, 219, 0.15)', border: '1px dashed #3498DB', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#90caf9' }}>
                  Student Join Code
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1, bgcolor: 'background.paper', px: 2, py: 0.5, borderRadius: 1, border: '1px solid rgba(255,255,255,0.2)' }}>
                    {quizData.accessCode}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={quizData.description}
                onChange={handleQuizChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={quizData.category}
                  onChange={handleQuizChange}
                  required
                >
                  <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                  <MenuItem value="true-false">True/False</MenuItem>
                  <MenuItem value="short-answer">Short Answer</MenuItem>
                  <MenuItem value="matching">Matching</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time Limit (minutes)"
                name="timeLimit"
                type="number"
                value={quizData.timeLimit}
                onChange={handleQuizChange}
              />
            </Grid>
          </Grid>
        </DecorativeSection>

        {(quizData.questions || []).map((question, questionIndex) => (
          <DecorativeSection 
            key={questionIndex}
            title={`Question ${questionIndex + 1}`}
            icon={<SchoolIcon sx={{ fontSize: 30, color: '#E67E22' }} />}
          >
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Question"
                value={question.question}
                onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                required
              />
            </Box>

            {renderQuestionOptions(question, questionIndex)}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <IconButton
                onClick={() => removeQuestion(questionIndex)}
                sx={{ 
                  color: '#E74C3C',
                  '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.1)' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </DecorativeSection>
        ))}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addQuestion}
            sx={{ 
              color: getButtonColor(),
              borderColor: getButtonColor(),
              '&:hover': { 
                borderColor: getButtonHoverColor(),
                backgroundColor: `${getButtonColor()}1A`
              }
            }}
          >
            Add Question
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              backgroundColor: '#2ECC71',
              '&:hover': { backgroundColor: '#27AE60' }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </form>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}
      </style>
    </Container>
  );
}

export default EditQuiz; 