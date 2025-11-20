export interface Team {
  name: string;
}

export interface Stats {
  form: string; // e.g., 'WWLDW'
  goalsFor: number;
  goalsAgainst: number;
  possession: number; // percentage
  shotsOnTarget: number;
}

export interface HeadToHead {
  wins: number;
  draws: number;
  losses: number;
}

export interface Match {
  homeTeam: Team;
  awayTeam: Team;
  homeStats: Stats;
  awayStats: Stats;
  headToHead: {
    home: HeadToHead;
    away: HeadToHead;
  };
  league: string;
}

export interface MatchPrediction extends Match {
  prediction: string;
  reasoning: string;
}