import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  TextField,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { quizDb } from '../utils/supabaseClient';
import QuizIcon from '@mui/icons-material/Quiz';
import HistoryIcon from '@mui/icons-material/History';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import StarsIcon from '@mui/icons-material/Stars';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

// Decorative background component
const DecorativeBackground = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      overflow: 'hidden',
      opacity: 0.1,
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        transform: 'rotate(-15deg)',
        animation: 'float 6s ease-in-out infinite',
      }}
    >
      <SchoolOutlinedIcon sx={{ fontSize: 100, color: '#3498DB' }} />
    </Box>
    <Box
      sx={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        transform: 'rotate(15deg)',
        animation: 'float 8s ease-in-out infinite',
      }}
    >
      <LightbulbIcon sx={{ fontSize: 80, color: '#E67E22' }} />
    </Box>
    <Box
      sx={{
        position: 'absolute',
        bottom: '15%',
        left: '15%',
        transform: 'rotate(10deg)',
        animation: 'float 7s ease-in-out infinite',
      }}
    >
      <StarsIcon sx={{ fontSize: 90, color: '#9B59B6' }} />
    </Box>
  </Box>
);

const DecorativeCard = ({ children, iconColor, buttonColor, hoverColor }) => (
  <Card 
    sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: 'inherit',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 15px 35px rgba(${iconColor === '#3498DB' ? '52, 152, 219' : iconColor === '#2ECC71' ? '46, 204, 113' : iconColor === '#E67E22' ? '230, 126, 34' : '155, 89, 182'}, 0.25)`,
        borderColor: iconColor,
      },
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${iconColor}, transparent)`,
      },
    }}
  >
    {children}
  </Card>
);

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [publishedQuizCount, setPublishedQuizCount] = useState(0);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const handleJoinQuiz = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode.trim()) {
      setJoinError('Please enter an access code.');
      return;
    }

    try {
      const targetQuiz = await quizDb.getQuizByAccessCode(joinCode.trim());

      if (!targetQuiz) {
        setJoinError('No quiz found with this access code.');
        return;
      }

      if (!targetQuiz.isPublished) {
        setJoinError('This quiz is currently in draft mode and cannot be joined.');
        return;
      }

      // Navigate to start the quiz
      navigate(`/take-quiz/${targetQuiz.id}`);
    } catch (err) {
      setJoinError('Error checking quiz code: ' + err.message);
    }
  };

  useEffect(() => {
    const checkUserAndQuizzes = async () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setUser(userData);
        
        // Count published quizzes for students
        if (userData.role === 'student') {
          try {
            const allQuizzes = await quizDb.getQuizzes();
            const publishedQuizzes = allQuizzes.filter(quiz => quiz.isPublished);
            setPublishedQuizCount(publishedQuizzes.length);
          } catch (err) {
            console.error("Failed to fetch quizzes for count:", err);
          }
        }
      }
    };

    checkUserAndQuizzes();
  }, [navigate]);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8, position: 'relative' }}>
        <DecorativeBackground />
        
        {/* Hero Section */}
        <Box 
          sx={{ 
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            color: '#0f172a',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
            position: 'relative',
            overflow: 'hidden',
            mb: 6,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: '900', letterSpacing: -1, background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Quizora
              </Typography>
              <Typography variant="h5" sx={{ color: '#475569', mb: 4, lineHeight: 1.6, fontWeight: 500 }}>
                The smart way to test knowledge. Create customized quizzes as a teacher, join instantly with a code as a student, and get personalized AI insights on every mistake.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  className="gradient-btn"
                  sx={{
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.8,
                    borderRadius: 2,
                  }}
                >
                  Get Started (Register)
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#2563eb',
                    borderColor: '#2563eb',
                    borderWidth: '2px',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.8,
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#1d4ed8',
                      borderWidth: '2px',
                      backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  Login to Account
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box 
                component="img"
                src="/institution_banner.png"
                alt="Quizora AI Institution Illustration"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '350px',
                  borderRadius: 3,
                  objectFit: 'cover',
                  boxShadow: '0 15px 35px rgba(15, 23, 42, 0.15)',
                  border: '4px solid #ffffff',
                  animation: 'float 6s ease-in-out infinite',
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Feature Sections */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              className="glass-panel glow-card"
              sx={{ 
                p: 4, 
                height: '100%', 
                borderRadius: 3,
                color: 'inherit'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <SchoolIcon sx={{ fontSize: 40, color: '#6366f1' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  For Teachers & Faculty
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.8, mb: 3, lineHeight: 1.7 }}>
                Easily draft, publish, and manage quizzes. Choose MCQ settings, specify questions, copy automatically generated student access codes, and analyze real-time scores on your detailed teacher dashboard.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/register?role=teacher')}
                sx={{ 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(45deg, #6366f1 30%, #4f46e5 90%)',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Create a Teacher Account &rarr;
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              className="glass-panel glow-card"
              sx={{ 
                p: 4, 
                height: '100%', 
                borderRadius: 3,
                color: 'inherit'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <LightbulbIcon sx={{ fontSize: 40, color: '#ec4899' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  For Students & Learners
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.8, mb: 3, lineHeight: 1.7 }}>
                Join quizzes instantly using a code provided by your teacher. Submit your responses, view immediate feedback, and benefit from interactive AI tutor insights for any wrong answers to improve your learning.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => navigate('/register?role=student')}
                sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #ec4899 30%, #db2777 90%)',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Join as a Student &rarr;
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (user.role === 'student') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
        <DecorativeBackground />
        
        <Box 
          sx={{ 
            mb: 6,
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
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome, {user.name}!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Ready to test your knowledge? Browse available quizzes and start learning!
          </Typography>
          {publishedQuizCount > 0 && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 2, 
                width: 'fit-content', 
                margin: '20px auto 0', 
                backgroundColor: 'rgba(52, 152, 219, 0.2)', 
                border: '1px solid rgba(52, 152, 219, 0.5)',
                color: 'white'
              }}
            >
              {publishedQuizCount} {publishedQuizCount === 1 ? 'quiz is' : 'quizzes are'} available for you to take!
            </Alert>
          )}
        </Box>

        <Paper 
          elevation={3} 
          className="glass-panel"
          sx={{ 
            p: 4, 
            mb: 4, 
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Join Quiz with Access Code
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
            Enter the 6-character code shared by your teacher to jump straight into the quiz.
          </Typography>
          
          <form onSubmit={handleJoinQuiz}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <TextField
                variant="outlined"
                placeholder="e.g. QZ8A1F"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                inputProps={{ maxLength: 10, style: { textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '2px', textAlign: 'center' } }}
                sx={{
                  flexGrow: 1,
                  maxWidth: '300px',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.6)' },
                    '&.Mui-focused fieldset': { borderColor: '#90caf9' },
                  }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                sx={{ 
                  height: '56px',
                  px: 4,
                  backgroundColor: '#2ECC71',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px 0 rgba(46, 204, 113, 0.4)',
                  '&:hover': {
                    backgroundColor: '#27AE60',
                    boxShadow: '0 6px 20px 0 rgba(46, 204, 113, 0.6)',
                  }
                }}
              >
                Join Quiz
              </Button>
            </Box>
          </form>

          {joinError && (
            <Alert severity="error" sx={{ mt: 2, bgcolor: 'rgba(231, 76, 60, 0.2)', color: 'white', border: '1px solid rgba(231, 76, 60, 0.4)' }}>
              {joinError}
            </Alert>
          )}
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <DecorativeCard iconColor="#3498DB" buttonColor="#3498DB" hoverColor="#2980B9">
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <QuizIcon sx={{ fontSize: 50, mr: 2, color: '#3498DB' }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Available Quizzes
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Browse through a variety of quizzes created by your teachers. Test your knowledge and track your progress.
                </Typography>
                {publishedQuizCount > 0 && (
                  <Typography variant="body2" sx={{ mt: 2, color: '#3498DB', fontWeight: 'bold' }}>
                    {publishedQuizCount} published {publishedQuizCount === 1 ? 'quiz' : 'quizzes'} ready to take
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => navigate('/quiz-list')}
                  sx={{ 
                    backgroundColor: '#3498DB',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#2980B9',
                    },
                  }}
                >
                  View Quizzes
                </Button>
              </CardActions>
            </DecorativeCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <DecorativeCard iconColor="#E67E22" buttonColor="#E67E22" hoverColor="#D35400">
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HistoryIcon sx={{ fontSize: 50, mr: 2, color: '#E67E22' }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Quiz History
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Review your past quiz attempts, see your scores, and track your improvement over time.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => navigate('/profile')}
                  sx={{ 
                    backgroundColor: '#E67E22',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#D35400',
                    },
                  }}
                >
                  View History
                </Button>
              </CardActions>
            </DecorativeCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <DecorativeCard iconColor="#9B59B6" buttonColor="#9B59B6" hoverColor="#8E44AD">
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmojiEventsIcon sx={{ fontSize: 50, mr: 2, color: '#9B59B6' }} />
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    Your Progress
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Check your performance statistics, achievements, and areas for improvement.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => navigate('/profile')}
                  sx={{ 
                    backgroundColor: '#9B59B6',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#8E44AD',
                    },
                  }}
                >
                  View Progress
                </Button>
              </CardActions>
            </DecorativeCard>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Teacher view
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
      <DecorativeBackground />
      
      <Box 
        sx={{ 
          mb: 6,
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
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome, {user.name}!
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Create and manage quizzes for your students. Choose from different quiz types to engage your class.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quizTypes.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type.id}>
            <DecorativeCard iconColor={type.buttonColor} buttonColor={type.buttonColor} hoverColor={type.hoverColor}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {type.icon}
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    {type.title}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {type.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={() => navigate('/create-quiz', { state: { quizType: type.id } })}
                  sx={{ 
                    backgroundColor: type.buttonColor,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: type.hoverColor,
                    },
                  }}
                >
                  Create Quiz
                </Button>
              </CardActions>
            </DecorativeCard>
          </Grid>
        ))}
      </Grid>

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

const quizTypes = [
  {
    id: 'multiple-choice',
    title: 'Multiple Choice',
    description: 'Create quizzes with multiple choice questions. Perfect for testing knowledge and understanding.',
    icon: <QuizIcon sx={{ fontSize: 50, mr: 2, color: '#3498DB' }} />,
    buttonColor: '#3498DB',
    hoverColor: '#2980B9',
  },
  {
    id: 'true-false',
    title: 'True/False',
    description: 'Quick true/false questions to test basic understanding and concepts.',
    icon: <ScienceIcon sx={{ fontSize: 50, mr: 2, color: '#2ECC71' }} />,
    buttonColor: '#2ECC71',
    hoverColor: '#27AE60',
  },
  {
    id: 'short-answer',
    title: 'Short Answer',
    description: 'Open-ended questions that allow students to demonstrate their understanding in their own words.',
    icon: <PsychologyIcon sx={{ fontSize: 50, mr: 2, color: '#E67E22' }} />,
    buttonColor: '#E67E22',
    hoverColor: '#D35400',
  },
  {
    id: 'matching',
    title: 'Matching',
    description: 'Create matching exercises to test relationships between concepts and definitions.',
    icon: <AutoStoriesIcon sx={{ fontSize: 50, mr: 2, color: '#9B59B6' }} />,
    buttonColor: '#9B59B6',
    hoverColor: '#8E44AD',
  },
];

export default Home; 