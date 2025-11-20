import { Match, Stats, Team, HeadToHead } from '../types';

// Mock database of teams
const TEAMS: { [key: string]: Team } = {
  'real madrid': { name: 'Real Madrid' },
  'barcelona': { name: 'FC Barcelona' },
  'manchester city': { name: 'Manchester City' },
  'liverpool': { name: 'Liverpool' },
  'bayern munich': { name: 'Bayern Munich' },
  'borussia dortmund': { name: 'Borussia Dortmund' },
  'paris saint-germain': { name: 'Paris Saint-Germain' },
  'olympique lyonnais': { name: 'Olympique Lyonnais' },
  'juventus': { name: 'Juventus' },
  'ac milan': { name: 'AC Milan' },
  'inter milan': { name: 'Inter Milan' },
  'chelsea': { name: 'Chelsea' },
  'arsenal': { name: 'Arsenal' },
  'manchester united': { name: 'Manchester United' },
  'atletico madrid': { name: 'Atlético Madrid' },
};

const UNKNOWN_TEAM: Team = { name: 'Bilinmeyen Takım' };

const getTeam = (name: string): Team => {
  const normalizedName = name.toLowerCase().trim();
  const foundKey = Object.keys(TEAMS).find(key => key.includes(normalizedName) || normalizedName.includes(key));
  return foundKey ? TEAMS[foundKey] : { ...UNKNOWN_TEAM, name: name };
};

const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateRandomForm = (): string => {
    const outcomes = ['G', 'B', 'M']; // Galibiyet, Beraberlik, Mağlubiyet
    let form = '';
    for (let i = 0; i < 5; i++) {
        form += outcomes[Math.floor(Math.random() * outcomes.length)];
    }
    return form;
};

const generateRandomStats = (): Stats => ({
    form: generateRandomForm(),
    goalsFor: getRandomInt(15, 40),
    goalsAgainst: getRandomInt(10, 35),
    possession: getRandomInt(45, 65),
    shotsOnTarget: getRandomInt(3, 8),
});

const generateRandomH2H = (): HeadToHead => ({
    wins: getRandomInt(2, 10),
    draws: getRandomInt(1, 5),
    losses: getRandomInt(2, 10),
});

// This is a mock function. In a real app, you would fetch this from a sports API.
export const findMatchesByNames = async (matchNames: string[]): Promise<Match[]> => {
  return new Promise(resolve => {
    setTimeout(() => { // Simulate network delay
      const matches: Match[] = matchNames.map(matchName => {
        const [homeTeamName = 'Bilinmeyen', awayTeamName = 'Bilinmeyen'] = matchName.split(/\s+vs\s+/i);
        
        const homeTeam = getTeam(homeTeamName);
        const awayTeam = getTeam(awayTeamName);
        
        const homeH2H = generateRandomH2H();
        const awayH2H = {
            wins: homeH2H.losses,
            draws: homeH2H.draws,
            losses: homeH2H.wins
        };

        return {
          homeTeam: homeTeam,
          awayTeam: awayTeam,
          homeStats: generateRandomStats(),
          awayStats: generateRandomStats(),
          headToHead: {
            home: homeH2H,
            away: awayH2H,
          },
          league: 'Şampiyonlar Ligi',
        };
      });
      resolve(matches);
    }, 1000);
  });
};