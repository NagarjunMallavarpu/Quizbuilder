import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateQuiz from './pages/CreateQuiz';
import QuizList from './pages/QuizList';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import Profile from './pages/Profile';
import EditQuiz from './pages/EditQuiz';
import Dashboard from './pages/Dashboard';
import ImportExport from './pages/ImportExport';
import StudentResult from './pages/StudentResult';
import About from './pages/About';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import StarsIcon from '@mui/icons-material/Stars';

const DecorativeBackground = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      overflow: 'hidden',
      opacity: 0.12,
      pointerEvents: 'none',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: '12%',
        left: '5%',
        transform: 'rotate(-15deg)',
        animation: 'float 7s ease-in-out infinite',
      }}
    >
      <SchoolOutlinedIcon sx={{ fontSize: 100, color: '#FF6B6B', filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.1))' }} />
    </Box>
    <Box
      sx={{
        position: 'absolute',
        top: '20%',
        right: '8%',
        transform: 'rotate(15deg)',
        animation: 'float-reverse 9s ease-in-out infinite',
      }}
    >
      <LightbulbIcon sx={{ fontSize: 80, color: '#FFD93D', filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.1))' }} />
    </Box>
    <Box
      sx={{
        position: 'absolute',
        bottom: '25%',
        left: '6%',
        transform: 'rotate(10deg)',
        animation: 'wiggle 5s ease-in-out infinite',
      }}
    >
      <ScienceIcon sx={{ fontSize: 90, color: '#6BCB77', filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.1))' }} />
    </Box>
    <Box
      sx={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        transform: 'rotate(-10deg)',
        animation: 'float 8s ease-in-out infinite',
      }}
    >
      <PsychologyIcon sx={{ fontSize: 95, color: '#FF9F43', filter: 'drop-shadow(3px 3px 0px rgba(0,0,0,0.1))' }} />
    </Box>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'bounce-slow 6s ease-in-out infinite',
      }}
    >
      <StarsIcon sx={{ fontSize: 70, color: '#4D96FF', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))' }} />
    </Box>
  </Box>
);

const theme = createTheme({
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Royal Blue
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#0d9488', // Teal
      light: '#2dd4bf',
      dark: '#0f766e',
    },
    background: {
      default: '#f8fafc', // Soft Slate
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.75) !important',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 4px 30px rgba(15, 23, 42, 0.03)',
          color: '#0f172a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
});

function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}

function TeacherRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'teacher') {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  useEffect(() => {

    // Fix any existing short answer quizzes in localStorage
    try {
      const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
      let needsUpdate = false;
      
      const fixedQuizzes = allQuizzes.map(quiz => {
        // For short answer quiz type
        if (quiz.category === 'short-answer') {
          let quizNeedsUpdate = false;
          const fixedQuestions = quiz.questions.map(question => {
            if (question.type === 'short-answer' && question.options && question.options.length > 0) {
              quizNeedsUpdate = true;
              return { ...question, options: [] };
            }
            return question;
          });
          
          if (quizNeedsUpdate) {
            needsUpdate = true;
            return { ...quiz, questions: fixedQuestions };
          }
        }
        return quiz;
      });
      
      if (needsUpdate) {
        localStorage.setItem('quizzes', JSON.stringify(fixedQuizzes));
        console.log('Fixed existing short answer quizzes in localStorage');
      }
    } catch (error) {
      console.error('Error fixing quizzes:', error);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div style={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
          backgroundImage: 'linear-gradient(rgba(248, 250, 252, 0.92), rgba(248, 250, 252, 0.92)), url("/institution_banner.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}>
          <Navbar />
          <DecorativeBackground />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/create-quiz"
              element={
                <TeacherRoute>
                  <CreateQuiz />
                </TeacherRoute>
              }
            />
            <Route
              path="/quiz-list"
              element={
                <ProtectedRoute>
                  <QuizList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/take-quiz/:id"
              element={
                <ProtectedRoute>
                  <TakeQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz-results/:id"
              element={
                <ProtectedRoute>
                  <QuizResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-quiz/:id"
              element={
                <TeacherRoute>
                  <EditQuiz />
                </TeacherRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <TeacherRoute>
                  <Dashboard />
                </TeacherRoute>
              }
            />
            <Route
              path="/import-export"
              element={
                <TeacherRoute>
                  <ImportExport />
                </TeacherRoute>
              }
            />
            <Route
              path="/student-result/:id"
              element={
                <TeacherRoute>
                  <StudentResult />
                </TeacherRoute>
              }
            />
            <Route
              path="/about"
              element={<About />}
            />
          </Routes>
          <Box 
            component="footer" 
            sx={{ 
              py: 3, 
              px: 2, 
              mt: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              &copy; {new Date().getFullYear()} Quizora. All rights reserved.
            </Typography>
          </Box>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
