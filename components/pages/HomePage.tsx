import React, { useState, useCallback } from 'react';
import { extractMatchesFromImage } from '../../services/geminiService';
import { getMatchPredictions } from '../../services/geminiService';
import { findMatchesByNames } from '../../services/footballApiService';
import { MatchPrediction } from '../../types';
import ImageUploader from '../ImageUploader';
import Loader from '../Loader';
import PredictionCard from '../PredictionCard';
import { ResetIcon } from '../IconComponents';
import { useAuth } from '../../context/AuthContext';

const HomePage: React.FC = () => {
  const { balance, decrementBalance } = useAuth();
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageAnalysis = useCallback(async (imageData: string) => {
    if (balance === null || balance < 1) {
        setError("Analiz yapmak için yeterli krediniz bulunmuyor.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setPredictions([]);

    try {
      setLoadingMessage('Maçlar için resim analiz ediliyor...');
      const extractedMatchNames = await extractMatchesFromImage(imageData);
      if (!extractedMatchNames || extractedMatchNames.length === 0) {
        throw new Error("Resimde herhangi bir maç tespit edilemedi. Lütfen daha net bir resim deneyin.");
      }

      setLoadingMessage('Maç istatistikleri alınıyor...');
      const detailedMatches = await findMatchesByNames(extractedMatchNames);

      setLoadingMessage('Yapay zeka tahminleri oluşturuluyor...');
      const aiPredictions = await getMatchPredictions(detailedMatches);

      // Decrement balance only on full success
      await decrementBalance();
      setPredictions(aiPredictions);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [balance, decrementBalance]);

  const handleReset = () => {
    setPredictions([]);
    setError(null);
    setIsLoading(false);
  };

  const hasCredits = balance !== null && balance > 0;

  return (
    <>
        {isLoading && <Loader message={loadingMessage} />}
        
        {!isLoading && error && (
          <div className="text-center p-8 w-full max-w-lg bg-red-900/20 border border-red-500 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Analiz Başarısız Oldu</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 mx-auto"
            >
              <ResetIcon />
              Tekrar Dene
            </button>
          </div>
        )}

        {!isLoading && !error && predictions.length === 0 && (
          <ImageUploader onAnalyze={handleImageAnalysis} isDisabled={!hasCredits} />
        )}

        {!isLoading && predictions.length > 0 && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Yapay Zeka Tahmin Sonuçları
                </h2>
                <button
                    onClick={handleReset}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm"
                >
                    <ResetIcon />
                    Yeni Analiz Yap
                </button>
            </div>
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <PredictionCard key={index} prediction={prediction} />
              ))}
            </div>
          </div>
        )}
      </>
  );
};

export default HomePage;