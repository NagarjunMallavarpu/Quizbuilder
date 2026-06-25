import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { quizDb } from '../utils/supabaseClient';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Load user data
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    setEditForm(prev => ({ ...prev, name: userData.name, email: userData.email }));

    // Load user's quizzes if teacher
    if (userData.role === 'teacher') {
      const fetchTeacherQuizzes = async () => {
        try {
          const allQuizzes = await quizDb.getQuizzes();
          const userQuizzes = allQuizzes.filter(quiz => String(quiz.createdBy) === String(userData.id));
          setQuizzes(userQuizzes);
        } catch (err) {
          console.error("Failed to load quizzes for profile:", err);
        }
      };
      fetchTeacherQuizzes();
    }

    // Load quiz results
    const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
    const userResults = results.filter(result => result.userId === userData.id);
    setQuizResults(userResults);
  }, [navigate]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Get all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find(u => u.id === user.id);

    // Validate current password
    if (editForm.currentPassword && currentUser.password !== editForm.currentPassword) {
      setError('Current password is incorrect');
      return;
    }

    // Validate new password if changing
    if (editForm.newPassword) {
      if (editForm.newPassword !== editForm.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      if (editForm.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
    }

    // Update user data
    const updatedUser = {
      ...currentUser,
      name: editForm.name,
      email: editForm.email,
      password: editForm.newPassword || currentUser.password,
    };

    // Update users array
    const updatedUsers = users.map(u => 
      u.id === user.id ? updatedUser : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Update current user
    const newUserData = {
      ...user,
      name: editForm.name,
      email: editForm.email,
    };
    localStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);

    setEditDialogOpen(false);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Remove user from users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter(u => u.id !== user.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Remove user's quizzes if teacher
      if (user.role === 'teacher') {
        const deleteTeacherQuizzes = async () => {
          try {
            const allQuizzes = await quizDb.getQuizzes();
            const quizzesToDelete = allQuizzes.filter(quiz => String(quiz.createdBy) === String(user.id));
            for (const q of quizzesToDelete) {
              await quizDb.deleteQuiz(q.id);
            }
          } catch (err) {
            console.error("Failed to delete user's quizzes:", err);
          }
        };
        deleteTeacherQuizzes();
      }

      // Remove user's quiz results
      const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const updatedResults = results.filter(result => result.userId !== user.id);
      localStorage.setItem('quizResults', JSON.stringify(updatedResults));

      // Clear current user and redirect to login
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" component="h1">
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Chip 
                  label={user.role === 'teacher' ? 'Teacher' : 'Student'} 
                  color={user.role === 'teacher' ? 'primary' : 'secondary'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Edit Profile
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </Paper>
        </Grid>

        {/* Quiz History/Results */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {user.role === 'teacher' ? 'My Quizzes' : 'Quiz History'}
            </Typography>
            <List>
              {user.role === 'teacher' ? (
                quizzes.map((quiz) => (
                  <ListItem
                    key={quiz.id}
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this quiz?')) {
                              try {
                                await quizDb.deleteQuiz(quiz.id);
                                const updatedQuizzes = quizzes.filter(q => q.id !== quiz.id);
                                setQuizzes(updatedQuizzes);
                              } catch (err) {
                                console.error("Failed to delete quiz:", err);
                              }
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={quiz.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {quiz.questions.length} questions
                          </Typography>
                          {quiz.isPublished && (
                            <Chip
                              label="Published"
                              color="success"
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                quizResults.map((result) => (
                  <ListItem key={result.id}>
                    <ListItemText
                      primary={result.quizTitle}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Score: {result.score}/{result.totalPoints} ({Math.round((result.score/result.totalPoints) * 100)}%)
                          </Typography>
                          <Typography component="div" variant="body2" color="text.secondary">
                            Completed: {new Date(result.date).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={editForm.currentPassword}
              onChange={(e) => setEditForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={editForm.newPassword}
              onChange={(e) => setEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={editForm.confirmPassword}
              onChange={(e) => setEditForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Changes</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Profile; 