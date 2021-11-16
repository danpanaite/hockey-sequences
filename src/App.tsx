import './App.css';
import React, {
  useState, useEffect,
} from 'react';
import {
  Autocomplete, Box, Card, Container, Grid, TextField, Typography, Slider, Stack, CardContent, CardActions, Button, ToggleButtonGroup, ToggleButton, Divider,
} from '@mui/material';
import { ParentSize } from '@visx/responsive';
import IceRinkSequence from './IceRinkSequence';
import {
  getPlaysForSequence, getSequences, getGames, Game, Play, Sequence,
} from './services/dataService';

const EVENTS = ['Faceoff Win', 'Shot', 'Goal', 'Zone Entry', 'Takeaway', 'Puck Recovery', 'Incomplete Play'];

export default function App() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['Shot', 'Faceoff Win']);
  const [filteredSequences, setFilteredSequences] = useState<Sequence[]>([]);

  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [selectedMark, setSelectedMark] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);

  const loadPlaysForSequence = async (id: string) => {
    const playsForSequence = await getPlaysForSequence(id);

    setPlays(playsForSequence);
    setSelectedPlay(playsForSequence[0]);
  };

  useEffect(() => {
    const loadGames = async () => {
      setGames(await getGames());
    };

    loadGames();
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      setSelectedGame(games[0]);
    }
  }, [games]);

  useEffect(() => {
    const loadSequences = async (game_date: string) => {
      setSequences(await getSequences(game_date));
    };

    if (selectedGame) {
      loadSequences(selectedGame.game_date);
    }
  }, [selectedGame]);

  useEffect(() => {
    if (sequences.length === 0 || selectedEvents.length === 0) {
      return;
    }

    const sequencesIncludingEvents = sequences
      .filter((sequence) => sequence.period === selectedPeriod)
      .filter((sequence) => !selectedEvents.find((event) => !sequence.events.includes(event)));

    setFilteredSequences(sequencesIncludingEvents);
  }, [sequences, selectedPeriod, selectedEvents]);

  useEffect(() => {
    if (filteredSequences.length > 0) {
      setSelectedSequence(filteredSequences[0]);
    }
  }, [filteredSequences]);

  useEffect(() => {
    if (selectedSequence) {
      loadPlaysForSequence(selectedSequence.id);
    }
  }, [selectedSequence]);

  const marks = filteredSequences.map((sequence) => ({
    value: sequence.start_time,
    // label: sequence.start_clock,
  }));

  const playIndex = (selectedPlay && plays.indexOf(selectedPlay)) || 0;
  console.log(playIndex);

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={3}>
          <Grid container item>
            <Typography variant="h4" sx={{ marginTop: 3 }}>
              Hockey Sequences
            </Typography>
          </Grid>
          <Grid container item xs={12}>
            {selectedGame && (
              <Card sx={{ padding: 3, width: '100%' }}>
                <Grid container spacing={2}>
                  <Grid item container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        size="small"
                        value={selectedGame}
                        disablePortal
                        id="game-input"
                        options={games}
                        getOptionLabel={(option) => `${option.game_date}: ${option.home_team} vs. ${option.away_team}`}
                        onChange={(event: any, newValue: any) => {
                          setSelectedGame(newValue);
                        }}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        renderInput={(params) => <TextField {...params} label="Game" />}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        multiple
                        size="small"
                        value={selectedEvents}
                        disablePortal
                        id="event-input"
                        options={EVENTS}
                        onChange={(event: any, newValue: any) => {
                          setSelectedEvents(newValue);
                        }}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        renderInput={(params) => <TextField {...params} label="Events" />}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" gutterBottom>Select Period</Typography>
                        <ToggleButtonGroup
                          value={selectedPeriod}
                          exclusive
                          onChange={(event: any, value: number) => { setSelectedPeriod(value); }}
                        >
                          <ToggleButton value={1} aria-label="list">
                            ONE
                          </ToggleButton>
                          <ToggleButton value={2} aria-label="module">
                            TWO
                          </ToggleButton>
                          <ToggleButton value={3} aria-label="quilt">
                            THREE
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      {marks.length > 0 && (
                        <Box sx={{ marginX: 2 }}>
                          <Typography variant="subtitle2" gutterBottom sx={{ marginLeft: -2 }}>
                            Select Sequence
                          </Typography>
                          <Slider
                            aria-label="Restricted values"
                            step={null}
                            value={selectedMark || 1200 * (selectedPeriod - 1)}
                            valueLabelDisplay="auto"
                            marks={marks}
                            min={1200 * (selectedPeriod - 1)}
                            max={1200 * (selectedPeriod)}
                            valueLabelFormat={(value: number) => {
                              const newSequence = filteredSequences?.find((sequence) => sequence.start_time === value);

                              return newSequence?.start_clock;
                            }}
                            onChange={(event: any, value: any) => {
                              setSelectedMark(value);
                            }}
                            onChangeCommitted={(event: any, value: any) => {
                              const newSequence = filteredSequences?.find((sequence) => sequence.start_time === value);
                              if (newSequence) {
                                setSelectedSequence(newSequence);
                              }
                            }}
                          />
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            )}
          </Grid>
          <Grid container item spacing={2}>
            <Grid item xs={12} md={6} display="flex" justifyContent="center">
              <Box height={{ xs: 150, sm: 300, md: 450 }} width="100%">
                <ParentSize
                  debounceTime={10}
                  parentSizeStyles={{
                    width: '100%', height: '100%', display: 'flex', justifyContent: 'center',
                  }}
                >
                  {({ width, height }) => (
                    <IceRinkSequence
                      plays={plays}
                      selectedPlay={selectedPlay}
                      onPlaySelected={(play) => setSelectedPlay(play)}
                      dimensions={{ width, height }}
                    />
                  )}
                </ParentSize>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {
                selectedPlay && (
                  <Card>
                    <CardContent>
                      <Grid container>
                        <Grid
                          item
                          xs={4}
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-start"
                          justifyContent="space-around"
                        >
                          <Typography variant="subtitle2" component="div">
                            {selectedPlay.away_team}
                          </Typography>
                          <Typography variant="overline" component="div">
                            {`${selectedPlay.away_team_skaters} skaters`}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} display="flex" flexDirection="column" alignItems="center">
                          <Typography variant="h5" component="div">
                            {`${selectedPlay.away_team_goals} : ${selectedPlay.home_team_goals}`}
                          </Typography>
                          <Typography variant="overline" component="div">
                            {`${selectedPlay.period} - ${selectedPlay.clock}`}
                          </Typography>
                        </Grid>
                        <Grid item xs={4} display="flex" flexDirection="column" alignItems="flex-end" justifyContent="space-around">
                          <Typography variant="subtitle2" component="div">
                            {selectedPlay.home_team}
                          </Typography>
                          <Typography variant="overline" component="div">
                            {`${selectedPlay.home_team_skaters} skaters`}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Divider />
                      <Typography variant="h6" marginTop={2}>
                        {`${selectedPlay.event} - ${selectedPlay.team}`}
                      </Typography>
                      <Typography variant="body1">
                        {
                          selectedPlay.event === 'Play' &&
                          `${selectedPlay.detail_1} pass from ${selectedPlay.player} to ${selectedPlay.player_2}.`
                        }
                        {
                          selectedPlay.event === 'Dump In/Out' &&
                          `${selectedPlay.event} by ${selectedPlay.player}. ${selectedPlay.detail_1}.`
                        }
                        {
                          selectedPlay.event === 'Puck Recovery' &&
                          `${selectedPlay.event} by ${selectedPlay.player}.`
                        }
                        {
                          selectedPlay.event === 'Takeaway' &&
                          `${selectedPlay.event} by ${selectedPlay.player}.`
                        }
                        {
                          selectedPlay.event === 'Zone Entry' &&
                          `${selectedPlay.detail_1} by ${selectedPlay.player}.`
                        }
                        {
                          selectedPlay.event === 'Faceoff Win' &&
                          `${selectedPlay.detail_1} by ${selectedPlay.player}.`
                        }
                        {
                          selectedPlay.event === 'Incomplete Play' &&
                          `Incomplete ${selectedPlay.detail_1.toLowerCase()} pass 
                            from ${selectedPlay.player} to ${selectedPlay.player_2}.`
                        }
                        {
                          selectedPlay.event === 'Shot' &&
                          `${selectedPlay.detail_1} 
                          ${selectedPlay.detail_4 === 't' ? 'one timer' : ''}
                          ${selectedPlay.detail_2.toLowerCase()}
                          ${selectedPlay.detail_3 === 't' ? 'with traffic' : ''}
                          from ${selectedPlay.player}.`
                        }
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        disabled={playIndex === 0}
                        onClick={() => setSelectedPlay(plays[playIndex - 1])}
                      >
                        Previous Play
                      </Button>
                      <Button
                        disabled={playIndex === plays.length - 1}
                        onClick={() => setSelectedPlay(plays[playIndex + 1])}
                      >
                        Next Play
                      </Button>
                    </CardActions>
                  </Card>
                )
              }
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
