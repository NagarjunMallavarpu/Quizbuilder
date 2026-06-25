import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import PublishIcon from '@mui/icons-material/Publish';

const DecorativeBackground = () => null;

function About() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8, position: 'relative' }}>
      <DecorativeBackground />

      {/* Header Banner */}
      <Box
        sx={{
          mb: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #0d9488 100%)',
          borderRadius: 3,
          p: 5,
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
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          About Quizora
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95, maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
          Quizora is a modern web application designed to make learning and evaluation interactive, seamless, and powered by AI tutor feedback. Whether you are a teacher building knowledge checkpoints or a student testing your limits, Quizora provides the ultimate toolkit.
        </Typography>
      </Box>

      {/* Manual Sections */}
      <Grid container spacing={4}>
        
        {/* Teacher Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            className="glass-panel"
            sx={{
              p: 4,
              height: '100%',
              borderRadius: 3,
              borderLeft: '6px solid #2563eb',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(16px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SchoolIcon sx={{ fontSize: 40, color: '#2563eb', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Teacher's Manual
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
              As a Teacher, you can design and publish quizzes, manage student permissions, and track results in real-time. Here is how you can use Quizora:
            </Typography>
            
            <Divider sx={{ mb: 3 }} />

            <List sx={{ '& .MuiListItem-root': { px: 0, py: 1.5 } }}>
              <ListItem>
                <ListItemIcon>
                  <QuizIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>1. Choose Quiz Type & Generate</Typography>}
                  secondary="Select between Multiple Choice, True/False, Short Answer, or Matching. You can type questions manually or click 'Generate with AI' to automatically create questions based on a topic."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <EditIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>2. Draft & Customize</Typography>}
                  secondary="Configure the quiz title, description, time limit, and options. You can easily add, edit, or delete questions. Created quizzes start in 'Draft' mode so you can preview them safely."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <PublishIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>3. Publish & Share Access Code</Typography>}
                  secondary="When your quiz is ready, click 'Publish'. An access code is automatically generated. Share this 6-character code (e.g. QZ8A1F) with your students."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <BarChartIcon sx={{ color: '#2563eb' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>4. Analyze Results</Typography>}
                  secondary="Visit your Dashboard to view student completion rates, average scores, and detailed score transcripts. Click on notifications to view individual student attempts."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Student Section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            className="glass-panel"
            sx={{
              p: 4,
              height: '100%',
              borderRadius: 3,
              borderLeft: '6px solid #0d9488',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(16px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AutoAwesomeIcon sx={{ fontSize: 40, color: '#0d9488', mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Student's Manual
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
              As a Student, you can join quizzes shared by your teacher, answer questions against a timer, and learn from mistakes. Here is how you can use Quizora:
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <List sx={{ '& .MuiListItem-root': { px: 0, py: 1.5 } }}>
              <ListItem>
                <ListItemIcon>
                  <VpnKeyIcon sx={{ color: '#0d9488' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>1. Enter Access Code</Typography>}
                  secondary="On the Home page, paste the 6-character access code provided by your teacher and click 'Join Quiz' to jump straight in."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <PlayArrowIcon sx={{ color: '#0d9488' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>2. Take the Quiz</Typography>}
                  secondary="Carefully answer each question. If the teacher set a time limit, keep an eye on the counting timer. Click submit once completed."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <AutoAwesomeIcon sx={{ color: '#0d9488' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>3. View Scores & Get AI Insights</Typography>}
                  secondary="Review your final score and check wrong answers. Click 'Get AI Insight' on any wrong answer to get immediate personal tutor feedback explaining the concept."
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <MenuBookIcon sx={{ color: '#0d9488' }} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>4. Review History</Typography>}
                  secondary="Check your Profile to view all past quiz attempts, completed dates, and score records to track your learning journey over time."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

      </Grid>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}
      </style>
    </Container>
  );
}

export default About;
