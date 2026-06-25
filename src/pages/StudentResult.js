import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function StudentResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'teacher') {
      navigate('/');
      return;
    }

    // Load attempt data
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get all quiz results
        const allResults = JSON.parse(localStorage.getItem('quizResults')) || [];
        const attemptData = allResults.find(result => result.id === parseInt(id) || result.id === id);
        
        if (!attemptData) {
          setError('Quiz attempt not found');
          setLoading(false);
          return;
        }
        
        setQuizAttempt(attemptData);
        
        // Get quiz data
        const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        const quizData = allQuizzes.find(q => q.id === attemptData.quizId);
        
        if (!quizData) {
          setError('Quiz data not found');
          setLoading(false);
          return;
        }
        
        // Verify teacher has access to this quiz
        if (String(quizData.createdBy) !== String(userData.id)) {
          setError('You do not have permission to view this quiz attempt');
          setLoading(false);
          return;
        }
        
        setQuiz(quizData);
        
        // Get student data
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const studentData = users.find(u => u.id === attemptData.userId);
        
        if (studentData) {
          setStudent(studentData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('An error occurred while loading the quiz attempt');
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!quizAttempt || !quiz) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>The requested quiz attempt could not be found.</Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  // Calculate percentage
  const scorePercentage = Math.round((quizAttempt.score / 10) * 100);

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
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Student Quiz Result
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/dashboard')}
            sx={{ 
              color: 'inherit', 
              borderColor: 'rgba(0, 0, 0, 0.2)',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            Back
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Quiz Info */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                  Quiz Information
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {quiz.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  {quiz.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip 
                    size="small" 
                    label={quiz.category.replace('-', ' ')} 
                    sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main' }} 
                  />
                  <Chip 
                    size="small" 
                    label={`${quiz.questions.length} questions`} 
                    sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: 'primary.main' }} 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Student Info */}
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'secondary.main', fontWeight: 'bold' }}>
                  Student Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {student ? student.name : 'Unknown Student'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {student ? student.email : 'No email available'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'bold', mt: 0.5 }}>
                      Student ID: {student ? student.id : quizAttempt.userId}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                  <DateRangeIcon fontSize="small" />
                  <Typography variant="body2">
                    Completed on {new Date(quizAttempt.completedAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <AssignmentTurnedInIcon fontSize="small" />
                  <Typography variant="body2">
                    Quiz ID: {quizAttempt.quizId}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: 'text.secondary' }}>
                  <AssignmentTurnedInIcon fontSize="small" />
                  <Typography variant="body2">
                    Attempt ID: {quizAttempt.id}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Score Display */}
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
            {quizAttempt.score}/10
          </Typography>
          <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
            {scorePercentage}%
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary' }}>
            {scorePercentage >= 70 
              ? 'Excellent! The student has mastered this material.' 
              : scorePercentage >= 40 
                ? 'Good effort. The student has a basic understanding but could improve.'
                : 'The student needs additional help with this material.'}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4, backgroundColor: 'rgba(0,0,0,0.1)' }} />
        
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Question-by-Question Analysis
        </Typography>

        <List>
          {quiz.questions.map((question, index) => {
            const userAnswer = quizAttempt.answers[index];
            let isCorrect = false;
            let correctAnswerText = '';
            let userAnswerText = '';
            
            if (question.type === 'multiple-choice') {
              isCorrect = parseInt(userAnswer) === question.correctAnswer;
              correctAnswerText = question.options[question.correctAnswer];
              userAnswerText = userAnswer !== '' ? question.options[parseInt(userAnswer)] : 'No answer';
            } else if (question.type === 'true-false') {
              isCorrect = userAnswer === (question.correctAnswer != null ? question.correctAnswer.toString() : '');
              correctAnswerText = question.correctAnswer === true || question.correctAnswer === 'true' || question.correctAnswer === 'True' ? 'True' : 'False';
              userAnswerText = userAnswer !== '' ? userAnswer : 'No answer';
            } else if (question.type === 'short-answer') {
              // For short answer questions, we'll show the correct answer and allow manual grading
              userAnswerText = userAnswer || 'No answer';
              correctAnswerText = question.correctAnswer || 'Not specified';
              
              // Basic string comparison to give initial assessment
              const userAnswerLower = userAnswer ? userAnswer.toLowerCase().trim() : '';
              const correctAnswerLower = question.correctAnswer ? question.correctAnswer.toLowerCase().trim() : '';
              
              // Check if the student's answer contains the correct answer as a substring
              isCorrect = userAnswerLower.includes(correctAnswerLower) && userAnswerLower.length > 0 && correctAnswerLower.length > 0;
            } else if (question.type === 'matching') {
              // Matching questions would have special handling
              userAnswerText = userAnswer || 'No answer';
              correctAnswerText = 'See matching pairs';
            }
            
            return (
              <ListItem 
                key={index}
                sx={{ 
                  mb: 2, 
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 1,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <Box sx={{ width: '100%', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'flex-start' }}>
                    <Box component="span" sx={{ mr: 1 }}>
                      Q{index + 1}:
                    </Box>
                    <Box component="span">{question.question}</Box>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', ml: 3 }}>
                    Type: {question.type.replace('-', ' ')} • {question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''}
                  </Typography>
                </Box>

                <Divider sx={{ width: '100%', mb: 2, backgroundColor: 'rgba(0,0,0,0.08)' }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ListItemText 
                        primary="Student's Answer" 
                        secondary={
                          <Typography variant="body2" sx={{ color: isCorrect ? '#27ae60' : '#c0392b', wordBreak: 'break-word', fontWeight: 'bold' }}>
                            {userAnswerText}
                          </Typography>
                        } 
                      />
                      {question.type !== 'short-answer' && question.type !== 'matching' && (
                        isCorrect ? (
                          <CheckCircleOutlineIcon sx={{ color: '#27ae60', ml: 1 }} />
                        ) : (
                          <HighlightOffIcon sx={{ color: '#c0392b', ml: 1 }} />
                        )
                      )}
                      
                      {question.type === 'short-answer' && (
                        <Box sx={{ display: 'flex', ml: 1 }}>
                          {isCorrect ? (
                            <CheckCircleOutlineIcon sx={{ color: '#27ae60' }} />
                          ) : (
                            <HelpOutlineIcon sx={{ color: '#d35400' }} />
                          )}
                          <Typography variant="caption" sx={{ ml: 1, color: '#d35400', fontWeight: 'bold' }}>
                            {isCorrect ? 'Likely correct' : 'Needs review'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ListItemText 
                      primary="Correct Answer" 
                      secondary={
                        <Typography variant="body2" sx={{ color: '#27ae60', wordBreak: 'break-word', fontWeight: 'bold' }}>
                          {correctAnswerText}
                        </Typography>
                      } 
                    />
                  </Grid>
                  
                  {question.type === 'short-answer' && (
                    <Grid item xs={12}>
                      <Box 
                        sx={{ 
                          mt: 1, 
                          p: 2, 
                          backgroundColor: 'rgba(0, 0, 0, 0.01)', 
                          borderRadius: 1,
                          border: '1px dashed rgba(0, 0, 0, 0.15)'  
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                          Teacher Notes: Short answer questions require teacher review. The system makes a basic assessment based on keyword matching.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: isCorrect ? '#27ae60' : '#d35400', fontWeight: 'bold' }}>
                          Status: {isCorrect ? 'Likely correct based on keywords' : 'May need manual review'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Student ID: {student ? student.id : quizAttempt.userId} | Attempt ID: {quizAttempt.id}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </ListItem>
            );
          })}
        </List>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            className="gradient-btn"
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default StudentResult; 