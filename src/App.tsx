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
  const REQUIRED_PLAYERS = 15;
  const [isViewMode, setIsViewMode] = useState(false);

  // Check if we're in view mode on mount and hash changes
  useEffect(() => {
    const checkViewMode = () => {
      const hash = window.location.hash;
      setIsViewMode(hash.startsWith('#/view'));
    };

    checkViewMode();
    window.addEventListener('hashchange', checkViewMode);
    return () => window.removeEventListener('hashchange', checkViewMode);
  }, []);

  const [players, setPlayers] = useState<Player[]>(() => {
    // Try to load data from URL hash first
    const hash = window.location.hash;
    if (hash.startsWith('#/view?data=')) {
      try {
        const encodedData = hash.replace('#/view?data=', '');
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        if (decodedData.players) {
          return decodedData.players;
        }
        if (decodedData.teams) {
          // Flatten all players from teams into a single array
          const allPlayers = decodedData.teams.flatMap((team: Team) => team.players);
          return allPlayers;
        }
      } catch (error) {
        console.error('Error parsing URL data:', error);
      }
    }
    // Fall back to localStorage if no URL data
    const savedPlayers = localStorage.getItem('soccerPlayers');
    return savedPlayers ? JSON.parse(savedPlayers) : [];
  });
  
  const [currentName, setCurrentName] = useState('');
  const [maxSkillDiff, setMaxSkillDiff] = useState(50);
  const [teams, setTeams] = useState<Team[]>(() => {
    // Try to load teams from URL hash first
    const hash = window.location.hash;
    if (hash.startsWith('#/view?data=')) {
      try {
        const encodedData = hash.replace('#/view?data=', '');
        const decodedData = JSON.parse(decodeURIComponent(encodedData));
        if (decodedData.teams) {
          return decodedData.teams;
        }
      } catch (error) {
        console.error('Error parsing URL data:', error);
      }
    }
    // Fall back to localStorage if no URL data
    const savedTeams = localStorage.getItem('soccerTeams');
    return savedTeams ? JSON.parse(savedTeams) : [];
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Add effect to handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/view?data=')) {
        try {
          const encodedData = hash.replace('#/view?data=', '');
          const decodedData = JSON.parse(decodeURIComponent(encodedData));
          if (decodedData.players) {
            setPlayers(decodedData.players);
          }
          if (decodedData.teams) {
            setTeams(decodedData.teams);
            if (!decodedData.players) {
              // If only teams were shared, extract players from teams
              const allPlayers = decodedData.teams.flatMap((team: Team) => team.players);
              setPlayers(allPlayers);
            }
          }
        } catch (error) {
          console.error('Error parsing URL data:', error);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
    if (currentName.trim() && players.length < REQUIRED_PLAYERS) {
      const newPlayerCount = players.length + 1;
      if (newPlayerCount <= REQUIRED_PLAYERS) {
        setPlayers([...players, { name: currentName.trim(), skillLevel: 50 }]);
        setCurrentName('');
      }
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
    const remainingCount = REQUIRED_PLAYERS - players.length;
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
    if (players.length !== REQUIRED_PLAYERS) return;

    let bestTeams: Team[] | null = null;
    let bestSkillDiff = Infinity;
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops

    while (attempts < maxAttempts) {
      attempts++;
      
      // Create a shuffled copy of players
      const shuffledPlayers = [...players];
      for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
      }
      
      // Initialize three teams
      const teamAssignments: Team[] = [
        { players: [], totalSkill: 0 },
        { players: [], totalSkill: 0 },
        { players: [], totalSkill: 0 },
      ];

      // Distribute players in a snake draft pattern
      for (let i = 0; i < shuffledPlayers.length; i++) {
        const player = shuffledPlayers[i];
        const targetTeamIndex = i % 3;
        teamAssignments[targetTeamIndex].players.push(player);
        teamAssignments[targetTeamIndex].totalSkill += player.skillLevel;
      }

      // Calculate max difference between teams
      const skills = teamAssignments.map(t => t.totalSkill);
      const currentMaxDiff = Math.max(...skills) - Math.min(...skills);

      // If this distribution is better than what we've seen, keep it
      if (currentMaxDiff < bestSkillDiff) {
        bestSkillDiff = currentMaxDiff;
        bestTeams = teamAssignments;

        // If we're within the max difference threshold, we can stop
        if (currentMaxDiff <= maxSkillDiff) {
          break;
        }
      }
    }

    if (bestTeams) {
      // Shuffle players within each team for display
      bestTeams.forEach(team => {
        for (let i = team.players.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [team.players[i], team.players[j]] = [team.players[j], team.players[i]];
        }
      });

      setTeams(bestTeams);
      if (bestSkillDiff > maxSkillDiff) {
        setSnackbarMessage(`Best possible difference was ${bestSkillDiff} after ${attempts} attempts`);
        setSnackbarOpen(true);
      }
    }
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
    // Use hash-based routing instead of path-based to avoid service worker issues
    return `${baseUrl}/#/view?data=${encodedData}`;
  };

  // Function to shorten URL using TinyURL
  const shortenUrl = async (url: string): Promise<string> => {
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to shorten URL');
      return await response.text();
    } catch (error) {
      console.error('Error shortening URL:', error);
      return url; // Return original URL if shortening fails
    }
  };

  // Function to share URL or fallback to clipboard
  const shareUrl = async (includeSkills: boolean, rosterOnly: boolean = false) => {
    const longUrl = generateShareableUrl(includeSkills, rosterOnly);
    const url = await shortenUrl(longUrl);
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

          {isViewMode ? (
            // View mode - show only the teams/roster
            <Paper elevation={3} sx={{ p: 3 }}>
              {teams.length > 0 ? (
                <Box>
                  <Box sx={{ 
                    pb: 2,
                    mb: 3,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6" color="primary.dark">
                      Team Distribution
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      href="/"
                      size="small"
                    >
                      Create New Teams
                    </Button>
                  </Box>
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
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Player Roster
                  </Typography>
                  <List>
                    {players.map((player, index) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={player.name}
                          secondary={`Skill Level: ${player.skillLevel}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    variant="outlined"
                    color="primary"
                    href="/"
                    sx={{ mt: 2 }}
                  >
                    Create Teams
                  </Button>
                </Box>
              )}
            </Paper>
          ) : (
            // Edit mode - show the full team builder interface
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
                      Players ({players.length}/{REQUIRED_PLAYERS})
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
                      disabled={players.length >= REQUIRED_PLAYERS}
                      startIcon={<PersonAddIcon />}
                    >
                      Add
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={addRemainingPlayers}
                      disabled={players.length >= REQUIRED_PLAYERS}
                      startIcon={<GroupAddIcon />}
                    >
                      Add Rest
                    </Button>
                  </Box>

                  <Typography variant="subtitle1" color="primary.dark" gutterBottom sx={{ fontWeight: 600 }}>
                    Skill Levels
                  </Typography>
                  <Paper variant="outlined" sx={{ 
                    height: 'calc(100vh - 450px)',
                    overflow: 'auto',
                    borderRadius: 2
                  }}>
                    <List sx={{ 
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

                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Maximum Skill Difference: {maxSkillDiff}
                    </Typography>
                    <Slider
                      size="small"
                      value={maxSkillDiff}
                      onChange={(_, newValue) => setMaxSkillDiff(newValue as number)}
                      min={0}
                      max={200}
                      valueLabelDisplay="auto"
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={calculateTeams}
                        disabled={players.length !== REQUIRED_PLAYERS}
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
                      {players.length > 0 && players.length !== REQUIRED_PLAYERS && (
                        <Typography variant="caption" color="error">
                          Need exactly {REQUIRED_PLAYERS} players for 3 teams of 5
                        </Typography>
                      )}
                    </Box>
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
                        Add exactly {REQUIRED_PLAYERS} players to create 3 balanced teams of 5 players each
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
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
