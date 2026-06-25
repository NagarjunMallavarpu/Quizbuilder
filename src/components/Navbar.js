import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { quizDb } from '../utils/supabaseClient';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';

function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Only load notifications for teachers
    if (user && user.role === 'teacher') {
      // Check for recent quiz attempts
      checkRecentAttempts();
      
      // Set up interval to check for new attempts every minute
      const interval = setInterval(checkRecentAttempts, 60000);
      
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkRecentAttempts = async () => {
    try {
      // Get all quizzes created by this teacher
      const allQuizzes = await quizDb.getQuizzes();
      const teacherQuizzes = allQuizzes.filter(quiz => String(quiz.createdBy) === String(user.id));
      
      if (teacherQuizzes.length === 0) {
        setNotificationCount(0);
        setRecentAttempts([]);
        return;
      }
      
      // Get all quiz results
      const allResults = JSON.parse(localStorage.getItem('quizResults')) || [];
      
      // Find results for teacher's quizzes from the last 24 hours
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const recentResults = allResults.filter(result => {
        return (
          teacherQuizzes.some(quiz => String(quiz.id) === String(result.quizId)) &&
          new Date(result.completedAt) > oneDayAgo
        );
      });
      
      // Sort by most recent first
      recentResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      
      // Add quiz and student info to the results
      const resultsWithDetails = recentResults.map(result => {
        const quiz = teacherQuizzes.find(q => String(q.id) === String(result.quizId));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const student = users.find(u => String(u.id) === String(result.userId));
        
        return {
          id: result.id,
          quizId: result.quizId,
          quizTitle: quiz ? quiz.title : 'Unknown Quiz',
          studentName: student ? student.name : 'Unknown Student',
          score: result.score,
          completedAt: result.completedAt,
          userId: result.userId,
        };
      });
      
      // Get already viewed notification IDs from localStorage
      const viewedNotifications = JSON.parse(localStorage.getItem(`viewed_notifications_${user.id}`)) || [];
      
      // Filter out already viewed notifications
      const unviewedResults = resultsWithDetails.filter(result => !viewedNotifications.includes(result.id));
      
      // Set recent attempts to show only unviewed notifications
      setRecentAttempts(unviewedResults);
      
      // Count unviewed notifications
      setNotificationCount(unviewedResults.length);
    } catch (error) {
      console.error('Error checking recent attempts:', error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
    
    // Mark all notifications as viewed
    if (recentAttempts.length > 0) {
      const viewedNotifications = JSON.parse(localStorage.getItem(`viewed_notifications_${user.id}`)) || [];
      
      // Add all current notification IDs to the viewed list
      recentAttempts.forEach(attempt => {
        if (!viewedNotifications.includes(attempt.id)) {
          viewedNotifications.push(attempt.id);
        }
      });
      
      // Update localStorage with viewed notifications
      localStorage.setItem(`viewed_notifications_${user.id}`, JSON.stringify(viewedNotifications));
      
      // Reset notification count
      setNotificationCount(0);
    }
  };

  const handleViewAttempt = (attemptId) => {
    handleNotificationClose();
    navigate(`/student-result/${attemptId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 4px 30px rgba(15, 23, 42, 0.03)',
        top: 0,
        zIndex: 1100,
        color: '#0f172a',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: '900',
            letterSpacing: '1.2px',
            background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          onClick={() => navigate('/')}
        >
          Quizora
        </Typography>
        {user ? (
          <>
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              <Button
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                sx={{
                  color: '#475569',
                  fontWeight: '600',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                  },
                }}
              >
                Home
              </Button>
              <Button
                onClick={() => navigate('/quiz-list')}
                startIcon={<ListIcon />}
                sx={{
                  color: '#475569',
                  fontWeight: '600',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                  },
                }}
              >
                Quiz List
              </Button>
              {user.role === 'teacher' && (
                <>
                  <Button
                    onClick={() => navigate('/create-quiz')}
                    startIcon={<AddIcon />}
                    sx={{
                      color: '#475569',
                      fontWeight: '600',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563eb',
                      },
                    }}
                  >
                    Create Quiz
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    startIcon={<DashboardIcon />}
                    sx={{
                      color: '#475569',
                      fontWeight: '600',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563eb',
                      },
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    onClick={() => navigate('/import-export')}
                    startIcon={<ImportExportIcon />}
                    sx={{
                      color: '#475569',
                      fontWeight: '600',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563eb',
                      },
                    }}
                  >
                    Import/Export
                  </Button>
                </>
              )}
              <Button
                onClick={() => navigate('/about')}
                startIcon={<HelpIcon />}
                sx={{
                  color: '#475569',
                  fontWeight: '600',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                  },
                }}
              >
                About
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                startIcon={<PersonIcon />}
                sx={{
                  color: '#475569',
                  fontWeight: '600',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                  },
                }}
              >
                Profile
              </Button>
            </Box>
            
            {/* Notifications for teachers */}
            {user.role === 'teacher' && (
              <Tooltip title="Recent quiz attempts">
                <IconButton
                  size="large"
                  onClick={handleNotificationClick}
                  sx={{
                    mr: 1,
                    color: '#475569',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      color: '#2563eb',
                    },
                  }}
                >
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            <Menu
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
              PaperProps={{
                sx: {
                  width: 350,
                  maxHeight: 400,
                  overflowY: 'auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: '#0f172a',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <Typography sx={{ px: 2, py: 1, fontWeight: 'bold', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', color: '#0f172a' }}>
                Recent Quiz Attempts
              </Typography>
              
              {recentAttempts.length > 0 ? (
                recentAttempts.map(attempt => (
                  <MenuItem 
                    key={attempt.id} 
                    onClick={() => handleViewAttempt(attempt.id)}
                    sx={{
                      borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                      '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                        {attempt.quizTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8, color: '#475569' }}>
                          {attempt.studentName}
                        </Typography>
                        <Chip 
                          label={`${attempt.score}/10`}
                          size="small"
                          sx={{ 
                            backgroundColor: attempt.score >= 7 ? 'rgba(46, 204, 113, 0.15)' : 
                                           attempt.score >= 4 ? 'rgba(241, 196, 15, 0.15)' : 
                                           'rgba(231, 76, 60, 0.15)',
                            color: attempt.score >= 7 ? '#27ae60' : 
                                   attempt.score >= 4 ? '#d35400' : 
                                   '#c0392b',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mt: 0.5, color: '#64748b' }}>
                        {new Date(attempt.completedAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled sx={{ opacity: 0.7 }}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>No new notifications</Typography>
                </MenuItem>
              )}
            </Menu>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{
                color: '#475569',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563eb',
                },
              }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: '#0f172a',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <MenuItem 
                onClick={() => {
                  handleClose();
                  handleLogout();
                }}
                sx={{
                  color: '#0f172a',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                  },
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              onClick={() => navigate('/')}
              startIcon={<HomeIcon />}
              sx={{
                color: '#475569',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563eb',
                },
              }}
            >
              Home
            </Button>
            <Button
              onClick={() => navigate('/about')}
              startIcon={<HelpIcon />}
              sx={{
                color: '#475569',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563eb',
                },
              }}
            >
              About
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              sx={{
                color: '#475569',
                fontWeight: '600',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563eb',
                },
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="contained"
              color="primary"
              onClick={() => navigate('/register')}
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2563eb 30%, #0d9488 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1d4ed8 30%, #0f766e 90%)',
                }
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 