import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  TextField,
  Grid,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

function ImportExport() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState({ success: [], errors: [] });
  const [showImportStatus, setShowImportStatus] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    loadUserQuizzes(userData.id);
  }, [navigate]);

  const loadUserQuizzes = (userId) => {
    const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const filteredQuizzes = allQuizzes.filter(quiz => quiz.createdBy === userId);
    setUserQuizzes(filteredQuizzes);
  };

  const handleExportClick = () => {
    if (selectedQuizzes.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one quiz to export',
        severity: 'warning'
      });
      return;
    }

    const allQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quizzesToExport = allQuizzes.filter(quiz => selectedQuizzes.includes(quiz.id));
    
    // Prepare quizzes for export by removing user-specific data
    const exportQuizzes = quizzesToExport.map(quiz => {
      const { createdBy, ...exportQuiz } = quiz;
      return {
        ...exportQuiz,
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0'
      };
    });
    
    setExportData(JSON.stringify(exportQuizzes, null, 2));
    setSnackbar({
      open: true,
      message: `${exportQuizzes.length} quizzes ready for export`,
      severity: 'success'
    });
  };

  const handleDownloadExport = () => {
    if (!exportData) {
      setSnackbar({
        open: true,
        message: 'No data to download. Generate export first.',
        severity: 'warning'
      });
      return;
    }
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizbuilder-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'Export file downloaded successfully',
      severity: 'success'
    });
  };

  const handleImport = () => {
    if (!importData) {
      setSnackbar({
        open: true,
        message: 'Please enter or paste quiz data to import',
        severity: 'warning'
      });
      return;
    }

    setImporting(true);
    setShowImportStatus(false);
    setImportStatus({ success: [], errors: [] });
    
    try {
      const importedQuizzes = JSON.parse(importData);
      
      // Validate the imported data
      if (!Array.isArray(importedQuizzes)) {
        throw new Error('Invalid import data format. Expected an array of quizzes.');
      }
      
      const successQuizzes = [];
      const errorQuizzes = [];
      
      // Process each quiz
      importedQuizzes.forEach(quiz => {
        try {
          // Validate required fields
          if (!quiz.title || !quiz.category || !quiz.questions || !Array.isArray(quiz.questions)) {
            throw new Error('Missing required fields');
          }
          
          // Add user ID and new ID to the quiz
          const newQuiz = {
            ...quiz,
            id: Date.now() + Math.floor(Math.random() * 1000), // Generate new ID
            createdBy: user.id,
            createdAt: new Date().toISOString(),
            isPublished: false // Default to unpublished for imports
          };
          
          successQuizzes.push(newQuiz);
        } catch (error) {
          errorQuizzes.push({
            title: quiz.title || 'Unknown Quiz',
            error: error.message
          });
        }
      });
      
      // Save successful imports to localStorage
      if (successQuizzes.length > 0) {
        const existingQuizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        localStorage.setItem('quizzes', JSON.stringify([...existingQuizzes, ...successQuizzes]));
        
        // Reload user quizzes
        loadUserQuizzes(user.id);
      }
      
      setImportStatus({
        success: successQuizzes.map(q => ({ title: q.title })),
        errors: errorQuizzes
      });
      
      setShowImportStatus(true);
      setImporting(false);
      
      if (successQuizzes.length > 0) {
        setSnackbar({
          open: true,
          message: `Successfully imported ${successQuizzes.length} quizzes`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'No quizzes were imported',
          severity: 'error'
        });
      }
      
    } catch (error) {
      setImporting(false);
      setSnackbar({
        open: true,
        message: `Import failed: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleQuizSelection = (quizId) => {
    setSelectedQuizzes(prev => {
      if (prev.includes(quizId)) {
        return prev.filter(id => id !== quizId);
      } else {
        return [...prev, quizId];
      }
    });
  };

  const selectAllQuizzes = () => {
    if (selectedQuizzes.length === userQuizzes.length) {
      setSelectedQuizzes([]);
    } else {
      setSelectedQuizzes(userQuizzes.map(quiz => quiz.id));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          mb: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
          borderRadius: 3,
          p: 4,
          color: 'white',
          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Import & Export Quizzes
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95 }}>
          Share your quizzes or import quizzes from others
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Export Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="glass-panel" sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FileDownloadIcon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                Export Quizzes
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Your Quizzes
                </Typography>
                <Button 
                  size="small" 
                  onClick={selectAllQuizzes}
                  color="primary"
                >
                  {selectedQuizzes.length === userQuizzes.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>
              
              {userQuizzes.length > 0 ? (
                <List sx={{ 
                  bgcolor: 'background.paper',
                  maxHeight: '200px',
                  overflow: 'auto',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 1,
                }}>
                  {userQuizzes.map(quiz => (
                    <ListItem
                      key={quiz.id}
                      button
                      onClick={() => toggleQuizSelection(quiz.id)}
                      selected={selectedQuizzes.includes(quiz.id)}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(37, 99, 235, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(37, 99, 235, 0.15)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <QuizIcon color={selectedQuizzes.includes(quiz.id) ? 'primary' : 'disabled'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={quiz.title} 
                        secondary={`Type: ${quiz.category.replace('-', ' ')} • ${quiz.questions.length} questions`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  You don't have any quizzes to export yet. Create some quizzes first.
                </Alert>
              )}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleExportClick}
                fullWidth
                startIcon={<FileDownloadIcon />}
                disabled={userQuizzes.length === 0}
                sx={{ mb: 2 }}
                className="gradient-btn"
              >
                Generate Export
              </Button>
              
              {exportData && (
                <>
                  <TextField
                    label="Export Data"
                    multiline
                    rows={6}
                    value={exportData}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{ mb: 2 }}
                  />
                  
                  <Button
                    variant="outlined"
                    onClick={handleDownloadExport}
                    fullWidth
                    startIcon={<FileDownloadIcon />}
                  >
                    Download Export File
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Import Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} className="glass-panel" sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <UploadFileIcon sx={{ fontSize: 28, mr: 1, color: 'secondary.main' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                Import Quizzes
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Paste the exported quiz data below to import:
              </Typography>
              
              <TextField
                label="Import Data"
                multiline
                rows={8}
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="Paste the JSON export data here..."
              />
              
              <Button
                variant="contained"
                onClick={handleImport}
                fullWidth
                startIcon={importing ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
                disabled={importing || !importData}
                className="gradient-btn"
              >
                {importing ? 'Importing...' : 'Import Quizzes'}
              </Button>
            </Box>
            
            {showImportStatus && (
              <Box sx={{ mt: 2 }}>
                {importStatus.success.length > 0 && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <AlertTitle>Successfully Imported</AlertTitle>
                    {importStatus.success.map((quiz, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <CheckCircleIcon sx={{ mr: 1, fontSize: 16 }} />
                        <Typography variant="body2">{quiz.title}</Typography>
                      </Box>
                    ))}
                  </Alert>
                )}
                
                {importStatus.errors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Failed to Import</AlertTitle>
                    {importStatus.errors.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'start', mt: 1 }}>
                        <ErrorIcon sx={{ mr: 1, fontSize: 16, mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                          <Typography variant="body2">{item.error}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Alert>
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Alert severity="info" icon={<InfoIcon />}>
                <AlertTitle>Import Guidelines</AlertTitle>
                <Typography variant="body2" component="div">
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li>Imported quizzes will be added to your account</li>
                    <li>All imported quizzes will be unpublished by default</li>
                    <li>You can edit imported quizzes after import</li>
                    <li>The import format must match the export format</li>
                  </ul>
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ImportExport; 