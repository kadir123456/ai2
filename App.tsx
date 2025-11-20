import React, { useState, useCallback } from 'react';
import { extractMatchesFromImage } from './services/geminiService';
import { getMatchPredictions } from './services/geminiService';
import { findMatchesByNames } from './services/footballApiService';
import { MatchPrediction } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import PredictionCard from './components/PredictionCard';
import { ResetIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageAnalysis = useCallback(async (imageData: string) => {
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
      setPredictions(aiPredictions);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  const handleReset = () => {
    setPredictions([]);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col items-center justify-center">
        {isLoading && <Loader message={loadingMessage} />}
        
        {!isLoading && error && (
          <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Analiz Başarısız Oldu</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <ResetIcon />
              Tekrar Dene
            </button>
          </div>
        )}

        {!isLoading && !error && predictions.length === 0 && (
          <ImageUploader onAnalyze={handleImageAnalysis} />
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
                    Yeni Kupon Analiz Et
                </button>
            </div>
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <PredictionCard key={index} prediction={prediction} />
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center p-4 text-gray-500 text-xs">
        <p>Tahminler yapay zeka tarafından oluşturulmuştur ve garanti edilmez. Lütfen sorumlu bir şekilde bahis yapın.</p>
        <p>&copy; 2024 Maç Tahmin Yapay Zekası. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default App;