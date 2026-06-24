import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

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
      <QuizIcon sx={{ fontSize: 100, color: '#3498DB' }} />
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
      <SchoolIcon sx={{ fontSize: 80, color: '#E67E22' }} />
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
      <EmojiEventsIcon sx={{ fontSize: 90, color: '#9B59B6' }} />
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
        boxShadow: `0 15px 35px rgba(${iconColor === '#2ECC71' ? '46, 204, 113' : '230, 126, 34'}, 0.25)`,
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

function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);

    // Fetch all quizzes from localStorage
    const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    
    // Fix any short answer quizzes that might have options
    const fixedQuizzes = allQuizzes.map(quiz => {
      if (quiz.category === 'short-answer') {
        const fixedQuestions = quiz.questions.map(question => {
          if (question.type === 'short-answer') {
            return { ...question, options: [] };
          }
          return question;
        });
        return { ...quiz, questions: fixedQuestions };
      }
      return quiz;
    });
    
    // Save the fixed quizzes back to localStorage
    if (JSON.stringify(fixedQuizzes) !== JSON.stringify(allQuizzes)) {
      localStorage.setItem('quizzes', JSON.stringify(fixedQuizzes));
      console.log('Fixed short answer quizzes in localStorage');
    }
    
    // Filter quizzes based on user role
    let filtered;
    if (userData.role === 'student') {
      // Students can only see published quizzes
      filtered = fixedQuizzes.filter((quiz) => quiz.isPublished);
    } else {
      // Teachers can see their own quizzes
      filtered = fixedQuizzes.filter((quiz) => quiz.createdBy === userData.id);
    }
    
    setQuizzes(filtered);
    setFilteredQuizzes(filtered);
  }, [navigate]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterQuizzes(value, selectedCategory);
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setSelectedCategory(value);
    filterQuizzes(searchTerm, value);
  };

  const filterQuizzes = (search, category) => {
    let filtered = quizzes;
    
    if (search) {
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(search.toLowerCase()) ||
        quiz.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === category);
    }
    
    setFilteredQuizzes(filtered);
  };

  const handleDelete = (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
      setQuizzes(updatedQuizzes);
      setFilteredQuizzes(updatedQuizzes);
      
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
      const updatedAllQuizzes = allQuizzes.filter(q => q.id !== quizId);
      localStorage.setItem('quizzes', JSON.stringify(updatedAllQuizzes));
      
      alert('Quiz deleted successfully');
    }
  };

  const handlePublishToggle = (quizId) => {
    const updatedQuizzes = quizzes.map(quiz => {
      if (quiz.id === quizId) {
        return { ...quiz, isPublished: !quiz.isPublished };
      }
      return quiz;
    });
    setQuizzes(updatedQuizzes);
    setFilteredQuizzes(updatedQuizzes);
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
  };

  const handleTakeQuiz = (quizId) => {
    // Get the quiz and ensure it's properly set up before navigating
    const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quiz = allQuizzes.find(q => q.id === quizId);
    
    if (quiz) {
      // Ensure quiz category is properly reflected in all questions
      const updatedQuiz = {
        ...quiz,
        questions: quiz.questions.map(q => ({
          ...q,
          type: quiz.category // Ensure each question's type matches the quiz category
        }))
      };
      
      // Save back to localStorage
      const updatedQuizzes = allQuizzes.map(q => 
        q.id === quizId ? updatedQuiz : q
      );
      
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    }
    
    navigate(`/take-quiz/${quizId}`);
  };

  const categories = ['all', 'multiple-choice', 'true-false', 'short-answer', 'matching'];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, position: 'relative' }}>
      <DecorativeBackground />
      
      <Box 
        sx={{ 
          mb: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
          borderRadius: 3,
          p: 4,
          color: 'white',
          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {user?.role === 'teacher' ? 'My Quizzes' : 'Available Quizzes'}
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.95 }}>
          {user?.role === 'teacher' 
            ? 'Manage your quizzes and track student progress'
            : 'Browse and take quizzes created by your teachers'}
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        className="glass-panel"
        sx={{ 
          p: 3, 
          mb: 4, 
          color: 'inherit',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {filteredQuizzes.map((quiz) => (
          <Grid item xs={12} sm={6} md={4} key={quiz.id}>
            <DecorativeCard 
              iconColor={quiz.isPublished ? '#2ECC71' : '#E67E22'}
              buttonColor={quiz.isPublished ? '#2ECC71' : '#E67E22'}
              hoverColor={quiz.isPublished ? '#27AE60' : '#D35400'}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    {quiz.title}
                  </Typography>
                  <Chip
                    label={quiz.isPublished ? 'Published' : 'Draft'}
                    color={quiz.isPublished ? 'success' : 'warning'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  {quiz.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<QuizIcon />}
                    label={quiz.category ? quiz.category.replace('-', ' ') : 'Quiz'}
                    size="small"
                    sx={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  <Chip
                    icon={<SchoolIcon />}
                    label={`${quiz.questions.length} questions`}
                    size="small"
                    sx={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  />
                  {user?.role === 'teacher' && quiz.accessCode && (
                    <Chip
                      label={`Code: ${quiz.accessCode}`}
                      size="small"
                      sx={{ 
                        background: 'rgba(52, 152, 219, 0.2)', 
                        color: '#90caf9', 
                        fontWeight: 'bold', 
                        border: '1px solid rgba(52, 152, 219, 0.4)' 
                      }}
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions>
                {user?.role === 'teacher' ? (
                  <>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                      sx={{ 
                        color: '#3498DB',
                        '&:hover': { backgroundColor: 'rgba(52, 152, 219, 0.1)' }
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={quiz.isPublished ? <UnpublishedIcon /> : <PublishIcon />}
                      onClick={() => handlePublishToggle(quiz.id)}
                      sx={{ 
                        color: quiz.isPublished ? '#E67E22' : '#2ECC71',
                        '&:hover': { 
                          backgroundColor: quiz.isPublished 
                            ? 'rgba(230, 126, 34, 0.1)' 
                            : 'rgba(46, 204, 113, 0.1)'
                        }
                      }}
                    >
                      {quiz.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(quiz.id)}
                      sx={{ 
                        color: '#E74C3C',
                        '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.1)' }
                      }}
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleTakeQuiz(quiz.id)}
                    sx={{ 
                      backgroundColor: '#3498DB',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#2980B9',
                      },
                    }}
                  >
                    Start Quiz
                  </Button>
                )}
              </CardActions>
            </DecorativeCard>
          </Grid>
        ))}
        
        {filteredQuizzes.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'rgba(44, 62, 80, 0.7)' }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                {user?.role === 'teacher' 
                  ? 'You haven\'t created any quizzes yet. Click on "Create Quiz" to get started!'
                  : 'No quizzes available. Check back later for new quizzes from your teachers.'}
              </Typography>
            </Paper>
          </Grid>
        )}
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

export default QuizList; 