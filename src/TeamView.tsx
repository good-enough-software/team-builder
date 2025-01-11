import { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  ThemeProvider,
  createTheme,
  CssBaseline,
  alpha,
  Button,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Use the same theme as the main app
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

interface Player {
  name: string;
  skillLevel: number;
}

interface Team {
  players: Player[];
  totalSkill: number;
}

interface ShareData {
  teams?: Team[];
  players?: Player[];
  includeSkills: boolean;
  timestamp: string;
  showBackButton: boolean;
  showCalculations: boolean;
  rosterOnly: boolean;
}

function TeamView() {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      // Get hash without the # symbol
      const hash = window.location.hash.substring(1);
      
      if (hash) {
        const params = new URLSearchParams(hash);
        const teams: Team[] = [];
        
        // Parse team1, team2, team3 from hash
        for (let i = 1; i <= 3; i++) {
          const teamPlayers = params.get(`team${i}`);
          if (teamPlayers) {
            const players = teamPlayers.split(',').map(name => ({
              name: decodeURIComponent(name.trim()),
              skillLevel: 50 // Default skill level
            }));
            teams.push({ players, totalSkill: 0 });
          }
        }
        
        if (teams.length > 0) {
          // Save teams to localStorage
          localStorage.setItem('soccerTeams', JSON.stringify(teams));
          
          setShareData({
            teams,
            includeSkills: false,
            timestamp: new Date().toISOString(),
            showBackButton: true,
            showCalculations: false,
            rosterOnly: false
          });
        } else {
          setError('No team data found');
        }
      } else {
        setError('No team data found');
      }
    } catch (err) {
      setError('Invalid team data');
    }
  }, []);

  const handleBackToBuilder = () => {
    const baseUrl = import.meta.env.DEV ? window.location.origin : 'https://good-enough-software.github.io/team-builder';
    window.location.href = baseUrl;
  };

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="error" gutterBottom>
                {error}
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToBuilder}
                sx={{ mt: 2 }}
              >
                Back to Team Builder
              </Button>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  if (!shareData) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            mb: 4 
          }}>
            <SportsSoccerIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" color="primary.main">
              {shareData.rosterOnly ? 'Soccer Roster' : 'Soccer Teams'}
            </Typography>
          </Box>

         

          {shareData.rosterOnly ? (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary.dark">
                Players ({shareData.players?.length || 0})
              </Typography>
              <Grid container spacing={2}>
                {shareData.players?.map((player, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {player.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Skill: {player.skillLevel}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {shareData.teams?.map((team, index) => (
                <Grid item xs={12} md={shareData.showCalculations ? 12 : 4} key={index}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2.5,
                      borderLeft: 6,
                      borderColor: index === 0 ? 'primary.main' : index === 1 ? 'secondary.main' : 'warning.main'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom sx={{ 
                      fontWeight: 'bold',
                      color: index === 0 ? 'primary.dark' : index === 1 ? 'secondary.dark' : 'warning.dark'
                    }}>
                      Team {index + 1}
                    </Typography>
                    <Grid container spacing={1}>
                      {team.players.map((player, playerIndex) => (
                        <Grid item xs={12} sm={shareData.showCalculations ? 6 : 12} md={shareData.showCalculations ? 4 : 12} key={playerIndex}>
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {player.name}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}

          {shareData.showCalculations && (
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'text.secondary' }}>
              Teams generated on: {new Date(shareData.timestamp).toLocaleString()}
            </Typography>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default TeamView; 