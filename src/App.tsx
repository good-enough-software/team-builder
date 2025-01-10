import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  Slider,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Grid,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
  alpha,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CalculateIcon from '@mui/icons-material/Calculate';
import ShareIcon from '@mui/icons-material/Share';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Forest green
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF9800', // Orange
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

function App() {
  const [players, setPlayers] = useState<Player[]>(() => {
    const savedPlayers = localStorage.getItem('soccerPlayers');
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  });
  
  const [currentName, setCurrentName] = useState('');
  const [teams, setTeams] = useState<Team[]>(() => {
    const savedTeams = localStorage.getItem('soccerTeams');
    return savedTeams ? JSON.parse(savedTeams) : [];
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Save players to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('soccerPlayers', JSON.stringify(players));
  }, [players]);

  // Save teams to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('soccerTeams', JSON.stringify(teams));
  }, [teams]);

  const resetAll = () => {
    setPlayers([]);
    setTeams([]);
    setCurrentName('');
  };

  const removePlayer = (indexToRemove: number) => {
    setPlayers(players.filter((_, index) => index !== indexToRemove));
    setTeams([]); // Clear teams when player list changes
  };

  const addPlayer = () => {
    if (currentName.trim() && players.length < 15) {
      setPlayers([...players, { name: currentName.trim(), skillLevel: 50 }]);
      setCurrentName('');
    }
  };

  const generateRandomPlayer = (index: number) => {
    const randomNames = [
      'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 
      'Sam', 'Jamie', 'Riley', 'Avery', 'Quinn',
      'Charlie', 'Drew', 'Parker', 'Blake', 'Cameron'
    ];
    const usedNames = players.map(p => p.name);
    const availableNames = randomNames.filter(name => !usedNames.includes(name));
    const randomName = availableNames[index % availableNames.length];
    const randomSkill = Math.floor(Math.random() * 101); // 0 to 100
    return { name: randomName, skillLevel: randomSkill };
  };

  const addRemainingPlayers = () => {
    const remainingCount = 15 - players.length;
    if (remainingCount <= 0) return;

    const newPlayers = [...players];
    for (let i = 0; i < remainingCount; i++) {
      newPlayers.push(generateRandomPlayer(i));
    }
    setPlayers(newPlayers);
  };

  const updateSkillLevel = (index: number, newValue: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], skillLevel: newValue };
    setPlayers(updatedPlayers);
  };

  const calculateTeams = () => {
    if (players.length !== 15) return;

    // Create a shuffled copy of players
    const shuffledPlayers = [...players]
      .sort(() => Math.random() - 0.5) // First random shuffle
      .sort(() => Math.random() - 0.5); // Second shuffle for better randomization
    
    // Initialize three teams
    const teamAssignments: Team[] = [
      { players: [], totalSkill: 0 },
      { players: [], totalSkill: 0 },
      { players: [], totalSkill: 0 },
    ];

    // Sort players by skill level for initial distribution
    const sortedPlayers = [...shuffledPlayers].sort((a, b) => b.skillLevel - a.skillLevel);

    // Distribute top players first (top 3)
    sortedPlayers.slice(0, 3).forEach((player, idx) => {
      teamAssignments[idx].players.push(player);
      teamAssignments[idx].totalSkill += player.skillLevel;
    });

    // Distribute middle players (next 6) with some randomization
    const middlePlayers = sortedPlayers.slice(3, 9);
    for (let i = 0; i < middlePlayers.length; i++) {
      const player = middlePlayers[i];
      // Find the team with the lowest total skill, but add some randomness
      const randomizedTeams = teamAssignments
        .map((team, index) => ({ index, totalSkill: team.totalSkill + (Math.random() * 20 - 10) }))
        .sort((a, b) => a.totalSkill - b.totalSkill);
      
      const targetTeam = teamAssignments[randomizedTeams[0].index];
      targetTeam.players.push(player);
      targetTeam.totalSkill += player.skillLevel;
    }

    // Distribute remaining players (last 6) with more randomization
    const remainingPlayers = sortedPlayers.slice(9);
    for (let i = 0; i < remainingPlayers.length; i++) {
      const player = remainingPlayers[i];
      // Even more randomness for the last players
      const randomizedTeams = teamAssignments
        .map((team, index) => ({ index, totalSkill: team.totalSkill + (Math.random() * 30 - 15) }))
        .sort((a, b) => a.totalSkill - b.totalSkill);
      
      const targetTeam = teamAssignments[randomizedTeams[0].index];
      targetTeam.players.push(player);
      targetTeam.totalSkill += player.skillLevel;
    }

    // Shuffle the players within each team for display
    teamAssignments.forEach(team => {
      team.players.sort(() => Math.random() - 0.5);
    });

    setTeams(teamAssignments);
  };

  // Function to generate shareable URLs
  const generateShareableUrl = (includeSkills: boolean, rosterOnly: boolean = false) => {
    const shareData = {
      players: rosterOnly ? players : undefined,
      teams: !rosterOnly ? (includeSkills ? teams : teams.map(team => ({
        ...team,
        players: team.players.map(player => ({
          name: player.name,
          skillLevel: player.skillLevel
        }))
      }))) : undefined,
      includeSkills,
      timestamp: new Date().toISOString(),
      showBackButton: !includeSkills,
      showCalculations: includeSkills,
      rosterOnly
    };
    const encodedData = encodeURIComponent(JSON.stringify(shareData));
    const baseUrl = import.meta.env.DEV ? window.location.origin : 'https://good-enough-software.github.io/team-builder';
    return `${baseUrl}/view?data=${encodedData}`;
  };

  // Function to share URL or fallback to clipboard
  const shareUrl = async (includeSkills: boolean, rosterOnly: boolean = false) => {
    const url = generateShareableUrl(includeSkills, rosterOnly);
    const title = rosterOnly ? 'Soccer Roster' : 'Soccer Teams';
    const text = rosterOnly ? 'Check out this soccer roster!' : 'Check out these soccer teams!';

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url
        });
        setSnackbarMessage('Shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setSnackbarMessage(rosterOnly ? 'Roster link copied!' : 'Team details copied!');
      }
      setSnackbarOpen(true);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setSnackbarMessage('Failed to share');
        setSnackbarOpen(true);
      }
    }
  };

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
              Soccer Team Builder
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Left side - Players (40%) */}
            <Grid item xs={12} md={5}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3,
                  pb: 2,
                  borderBottom: 1,
                  borderColor: 'divider'
                }}>
                  <Typography variant="h6" color="primary.dark">
                    Players ({players.length}/15)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => shareUrl(false, true)}
                      color="primary"
                      size="small"
                      disabled={players.length === 0}
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                      }}
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton 
                      onClick={resetAll} 
                      color="error" 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha('#f44336', 0.1),
                        '&:hover': { bgcolor: alpha('#f44336', 0.2) }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  mb: 3,
                  flexWrap: 'nowrap',
                  '& .MuiButton-root': {
                    whiteSpace: 'nowrap',
                    minWidth: 'auto'
                  }
                }}>
                  <TextField
                    size="small"
                    label="Player Name"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    sx={{ 
                      flexGrow: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={addPlayer}
                    disabled={players.length >= 15}
                    startIcon={<PersonAddIcon />}
                  >
                    Add
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={addRemainingPlayers}
                    disabled={players.length >= 15}
                    startIcon={<GroupAddIcon />}
                  >
                    Add Rest
                  </Button>
                </Box>

                <Typography variant="subtitle1" color="primary.dark" gutterBottom sx={{ fontWeight: 600 }}>
                  Skill Levels
                </Typography>
                <Paper variant="outlined" sx={{ 
                  maxHeight: 'calc(100vh - 450px)',
                  overflow: 'hidden',
                  borderRadius: 2
                }}>
                  <List sx={{ 
                    overflowY: 'auto',
                    maxHeight: '100%',
                    '& .MuiListItem-root': {
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 0
                      }
                    }
                  }}>
                    {players.map((player, index) => (
                      <ListItem key={index} sx={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        gap: 2,
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}>
                        <ListItemText 
                          primary={player.name} 
                          secondary={`Skill: ${player.skillLevel}`}
                          sx={{ 
                            minWidth: '120px',
                            '& .MuiListItemText-primary': {
                              fontWeight: 500
                            }
                          }}
                        />
                        <Slider
                          size="small"
                          value={player.skillLevel}
                          onChange={(_, newValue) => updateSkillLevel(index, newValue as number)}
                          min={0}
                          max={100}
                          valueLabelDisplay="auto"
                          sx={{ 
                            flex: 1,
                            color: 'primary.main',
                            '& .MuiSlider-thumb': {
                              '&:hover, &.Mui-focusVisible': {
                                boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`
                              }
                            }
                          }}
                        />
                        <IconButton 
                          onClick={() => removePlayer(index)} 
                          size="small"
                          sx={{ 
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: alpha('#f44336', 0.1)
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={calculateTeams}
                    disabled={players.length !== 15}
                    size="large"
                    startIcon={<CalculateIcon />}
                    sx={{ 
                      px: 4,
                      py: 1,
                      boxShadow: 4,
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                  >
                    Calculate Teams
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Right side - Teams (60%) */}
            <Grid item xs={12} md={7}>
              <Paper elevation={3} sx={{ p: 3, height: '100%', bgcolor: teams.length ? 'background.paper' : alpha(theme.palette.primary.main, 0.04) }}>
                {teams.length > 0 ? (
                  <Box>
                    <Typography variant="h6" gutterBottom color="primary.dark" sx={{ 
                      pb: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Team Distribution</span>
                      {teams.length > 0 && (
                        <IconButton
                          color="primary"
                          onClick={() => shareUrl(true)}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                          }}
                        >
                          <ShareIcon />
                        </IconButton>
                      )}
                    </Typography>
                    <Grid container spacing={2}>
                      {teams.map((team, index) => (
                        <Grid item xs={12} key={index}>
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
                              Team {index + 1} <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.9em' }}>
                                (Total Skill: {team.totalSkill})
                              </Box>
                            </Typography>
                            <Grid container spacing={1}>
                              {team.players.map((player, playerIndex) => (
                                <Grid item xs={12} sm={6} md={4} key={playerIndex}>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 1.5,
                                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                                      transition: 'all 0.2s',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        transform: 'translateY(-2px)'
                                      }
                                    }}
                                  >
                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                      {player.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      Skill: {player.skillLevel}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3
                  }}>
                    <SportsSoccerIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" align="center">
                      Add 15 players and click Calculate Teams to see the balanced teams here
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
