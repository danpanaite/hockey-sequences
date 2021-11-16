const DATA_URL = process.env.REACT_APP_DATA_URL;

export type Game = {
  'game_date': string,
  'home_team': string,
  'away_team': string,
};

export type Play = {
  'x_coord': number,
  'y_coord': number,
  'game_date': string,
  'home_team': string,
  'home_team_goals': number,
  'home_team_skaters': number,
  'away_team': string,
  'away_team_goals': number,
  'away_team_skaters': number,
  'team': string,
  'clock': string,
  'period': number,
  'event': string,
  'player': string,
  'detail_1': string,
  'detail_2': string,
  'detail_3': string,
  'detail_4': string,
  'player_2': string,
  'x_coord_2': number,
  'y_coord_2': number,
  'seconds_elapsed': number,
};

export type Sequence = {
  'id': string,
  'team': string,
  'game_date': string,
  'events': string,
  'start_clock': string,
  'start_time': number,
  'period': number,
};

export async function getGames(): Promise<Game[]> {
  const response = await fetch(`${DATA_URL}/games`);

  return response.json();
}

export async function getSequences(game_date: string): Promise<Sequence[]> {
  const response = await fetch(`${DATA_URL}/sequences?game_date=${game_date}`);

  return response.json();
}

export async function getPlaysForSequence(id: string): Promise<Play[]> {
  const response = await fetch(`${DATA_URL}/sequences/${id}/plays`);

  return response.json();
}
