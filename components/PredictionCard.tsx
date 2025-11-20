import React from 'react';
import { MatchPrediction, Stats, Team } from '../types';
import { SparklesIcon } from './IconComponents';


const StatItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="text-center">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="font-bold text-lg">{value}</p>
    </div>
);

const TeamDisplay: React.FC<{ team: Team, stats: Stats }> = ({ team, stats }) => (
    <div className="flex flex-col items-center space-y-2 flex-1">
        <h3 className="text-lg md:text-xl font-bold text-center h-16 md:h-20 flex items-center">{team.name}</h3>
        <p className="text-sm text-gray-400">Form: {stats.form}</p>
    </div>
);

const PredictionCard: React.FC<{ prediction: MatchPrediction }> = ({ prediction }) => {
  return (
    <div className="bg-gray-800/70 rounded-2xl shadow-xl backdrop-blur-sm border border-gray-700 overflow-hidden transition-all duration-300 hover:border-green-500/50 hover:shadow-2xl">
      <div className="p-5">
        <p className="text-center text-sm font-semibold text-gray-400 mb-4">{prediction.league}</p>
        <div className="flex justify-around items-start mb-6">
            <TeamDisplay team={prediction.homeTeam} stats={prediction.homeStats} />
            <div className="self-center text-2xl font-bold text-gray-500 pt-8">VS</div>
            <TeamDisplay team={prediction.awayTeam} stats={prediction.awayStats} />
        </div>

        <div className="grid grid-cols-3 gap-4 text-white mb-6 bg-gray-900/50 p-3 rounded-lg">
            <StatItem label="Atılan Gol" value={prediction.homeStats.goalsFor} />
            <div className="text-center"><p className="text-sm text-gray-400">İstatistik</p><p className="font-bold text-lg">-</p></div>
            <StatItem label="Atılan Gol" value={prediction.awayStats.goalsFor} />
            
            <StatItem label="Topla Oynama" value={`${prediction.homeStats.possession}%`} />
             <div className="text-center"><p className="text-sm text-gray-400">H2H Galibiyet</p><p className="font-bold text-lg">{prediction.headToHead.home.wins} : {prediction.headToHead.away.wins}</p></div>
            <StatItem label="Topla Oynama" value={`${prediction.awayStats.possession}%`} />
        </div>
        
      </div>
      <div className="bg-gradient-to-r from-green-500 to-blue-600 p-5">
        <div className="flex items-center gap-3 mb-2">
            <SparklesIcon className="w-6 h-6 text-white"/>
            <h4 className="text-xl font-bold text-white">Yapay Zeka Tahmini:</h4>
        </div>
        <p className="text-2xl font-extrabold text-white bg-black/20 px-3 py-1 rounded-md inline-block mb-2">{prediction.prediction}</p>
        <p className="text-white/90 text-sm">{prediction.reasoning}</p>
      </div>
    </div>
  );
};

export default PredictionCard;