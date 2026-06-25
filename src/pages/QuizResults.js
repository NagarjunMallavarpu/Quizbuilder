import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Collapse,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { fetchAIInsight } from '../utils/ai';
import { quizDb } from '../utils/supabaseClient';

function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizResult, setQuizResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hfToken, setHfToken] = useState(localStorage.getItem('hf_token') || import.meta.env.VITE_HF_TOKEN || '');
  const [showSettings, setShowSettings] = useState(false);
  const [insights, setInsights] = useState({});
  const [loadingInsights, setLoadingInsights] = useState({});
  const [tokenInput, setTokenInput] = useState(localStorage.getItem('hf_token') || import.meta.env.VITE_HF_TOKEN || '');

  const handleSaveToken = () => {
    localStorage.setItem('hf_token', tokenInput);
    setHfToken(tokenInput);
    setShowSettings(false);
  };

  const handleGetInsight = async (index, questionText, userAnswerText, correctAnswerText, category) => {
    setLoadingInsights(prev => ({ ...prev, [index]: true }));
    try {
      const insight = await fetchAIInsight(questionText, userAnswerText, correctAnswerText, category, hfToken);
      setInsights(prev => ({ ...prev, [index]: insight }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(prev => ({ ...prev, [index]: false }));
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }

    const fetchResultAndQuiz = async () => {
      // Get all results
      const results = JSON.parse(localStorage.getItem('quizResults')) || [];
      
      // Find the most recent result for this quiz for the current user
      const userResults = results
        .filter(result => result.quizId?.toString() === id?.toString())
        .filter(result => result.userId?.toString() === userData.id?.toString())
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      
      if (userResults.length > 0) {
        const result = userResults[0];
        setQuizResult(result);
        
        try {
          // Get the original quiz
          const foundQuiz = await quizDb.getQuizById(id);
          
          if (foundQuiz) {
            setQuiz(foundQuiz);
          } else {
            console.error('Quiz not found');
          }
        } catch (err) {
          console.error('Failed to fetch quiz details:', err);
        }
      } else {
        console.error('Result not found');
      }
      
      setLoading(false);
    };

    fetchResultAndQuiz();
  }, [id, navigate]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!quizResult || !quiz) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Result or quiz not found.</Alert>
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

  // Calculate percentage
  const scorePercentage = Math.round((quizResult.score / 10) * 100);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        className="glass-panel"
        sx={{ 
          p: 4, 
          color: 'inherit',
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Results: {quiz.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Completed on {new Date(quizResult.completedAt).toLocaleString()}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            textAlign: 'center', 
            p: 4, 
            mb: 4, 
            backgroundColor: scorePercentage >= 70 ? 'rgba(46, 204, 113, 0.15)' : scorePercentage >= 40 ? 'rgba(230, 126, 34, 0.15)' : 'rgba(231, 76, 60, 0.15)',
            borderRadius: 2,
            border: `2px solid ${scorePercentage >= 70 ? 'rgba(46, 204, 113, 0.4)' : scorePercentage >= 40 ? 'rgba(230, 126, 34, 0.4)' : 'rgba(231, 76, 60, 0.4)'}`,
          }}
        >
          <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: scorePercentage >= 70 ? '#27ae60' : scorePercentage >= 40 ? '#d35400' : '#c0392b' }}>
            {quizResult.score}/10
          </Typography>
          <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
            {scorePercentage}%
          </Typography>
          <Typography variant="body1">
            {scorePercentage >= 70 
              ? 'Great job! You\'ve mastered this quiz.' 
              : scorePercentage >= 40 
                ? 'Good effort! Keep studying to improve.'
                : 'Keep practicing. You\'ll get better!'}
          </Typography>
        </Box>

        {/* Hugging Face Settings */}
        <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              💡 <strong>AI Insights:</strong> {hfToken ? 'Live AI Mode Enabled' : 'Offline Mode (Enter Hugging Face Token for Live AI)'}
            </Typography>
            <Button size="small" variant="text" onClick={() => setShowSettings(!showSettings)}>
              {showSettings ? 'Hide Settings' : 'Configure API Key'}
            </Button>
          </Box>
          
          <Collapse in={showSettings}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Get a FREE API token from your <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Hugging Face Settings</a> to enable live AI tutor feedback for wrong answers.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  label="Hugging Face Token"
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  fullWidth
                />
                <Button variant="contained" onClick={handleSaveToken} className="gradient-btn">
                  Save
                </Button>
              </Box>
            </Box>
          </Collapse>
        </Box>

        <Divider sx={{ mb: 4, backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />
        
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Question Summary
        </Typography>

        <List>
          {quiz.questions.map((question, index) => {
            const userAnswer = quizResult.answers[index];
            let isCorrect = false;
            let correctAnswerText = '';
            let userAnswerText = '';
            
            if (question.type === 'multiple-choice') {
              isCorrect = parseInt(userAnswer) === question.correctAnswer;
              correctAnswerText = question.options[question.correctAnswer] || 'Not specified';
              userAnswerText = userAnswer !== undefined && userAnswer !== '' ? question.options[parseInt(userAnswer)] : 'No answer';
            } else if (question.type === 'true-false') {
              isCorrect = userAnswer === (question.correctAnswer != null ? question.correctAnswer.toString() : '');
              correctAnswerText = question.correctAnswer === 'true' || question.correctAnswer === true || question.correctAnswer === 'True' ? 'True' : 'False';
              userAnswerText = userAnswer !== undefined && userAnswer !== '' ? (userAnswer === 'true' ? 'True' : 'False') : 'No answer';
            } else if (question.type === 'short-answer') {
              const userAnswerLower = userAnswer ? userAnswer.toLowerCase().trim() : '';
              const correctAnswerLower = question.correctAnswer ? question.correctAnswer.toLowerCase().trim() : '';
              isCorrect = userAnswerLower.includes(correctAnswerLower) && userAnswerLower.length > 0 && correctAnswerLower.length > 0;
              correctAnswerText = question.correctAnswer || 'Not specified';
              userAnswerText = userAnswer || 'No answer';
            } else if (question.type === 'matching') {
              isCorrect = false;
              correctAnswerText = 'See matching pairs';
              userAnswerText = userAnswer ? 'Submitted matches' : 'No answer';
            }
            
            return (
              <ListItem 
                key={index}
                sx={{ 
                  mb: 2, 
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {index + 1}. {question.question}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ListItemText 
                        primary="Your Answer" 
                        secondary={
                          <Typography variant="body2" sx={{ color: isCorrect ? '#27ae60' : '#c0392b', fontWeight: 'bold' }}>
                            {userAnswerText}
                          </Typography>
                        } 
                      />
                      {isCorrect ? (
                        <CheckCircleOutlineIcon sx={{ color: '#27ae60', ml: 1 }} />
                      ) : (
                        <HighlightOffIcon sx={{ color: '#c0392b', ml: 1 }} />
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ListItemText 
                      primary="Correct Answer" 
                      secondary={
                        <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 'bold' }}>
                          {correctAnswerText}
                        </Typography>
                      } 
                    />
                  </Grid>

                  {!isCorrect && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(230, 126, 34, 0.05)', borderLeft: '4px solid #d35400', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LightbulbIcon sx={{ color: '#d35400' }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#d35400' }}>
                              AI learning Insight
                            </Typography>
                          </Box>
                          {!insights[index] && !loadingInsights[index] && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="warning"
                              onClick={() => handleGetInsight(index, question.question, userAnswerText, correctAnswerText, quiz.category)}
                              sx={{ textTransform: 'none' }}
                            >
                              Get AI explanation
                            </Button>
                          )}
                        </Box>
                        
                        {loadingInsights[index] && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <CircularProgress size={18} color="warning" />
                            <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.8 }}>
                              Consulting AI tutor...
                            </Typography>
                          </Box>
                        )}

                        {insights[index] && (
                          <Typography variant="body2" sx={{ color: 'text.primary', mt: 1, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {insights[index]}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </ListItem>
            );
          })}
        </List>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/quiz-list')}
            sx={{ 
              color: 'inherit', 
              borderColor: 'rgba(0,0,0,0.2)',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            Back to Quiz List
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/take-quiz/${id}`)}
            className="gradient-btn"
          >
            Retry Quiz
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default QuizResults; 