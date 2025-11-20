import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StoreIcon } from '../IconComponents';

interface Package {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  bestValue?: boolean;
}

const packages: Package[] = [
  { id: 'p_trial', name: 'Deneme Paketi', credits: 5, price: 30, description: 'Sistemi denemek için ideal.' },
  { id: 'p_standard', name: 'Standart Paket', credits: 25, price: 125, description: 'Düzenli kullanıcılar için.', bestValue: true },
  { id: 'p_pro', name: 'Profesyonel Paket', credits: 75, price: 300, description: 'Yoğun analizler için en iyisi.' },
];

const PurchaseCreditsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (pkg: Package) => {
    if (!currentUser) {
      setError('Ödeme yapmak için giriş yapmalısınız.');
      return;
    }

    setLoadingPackage(pkg.id);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('/.netlify/functions/start-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      if (!response.ok) {
        throw new Error('Ödeme başlatılamadı. Lütfen tekrar deneyin.');
      }

      const data = await response.json();
      
      // Redirect user to Shopier payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Ödeme URL\'si alınamadı.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      setLoadingPackage(null);
    }
  };

  return (
    <div className="w-full max-w-4xl text-center">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Kredi Paketleri</h1>
      <p className="text-gray-400 mb-8">Analiz yapmaya devam etmek için bir paket seçin.</p>
      
      {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-6 text-center">{error}</p>}
      
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className={`bg-gray-800/70 p-6 rounded-2xl border ${pkg.bestValue ? 'border-green-500' : 'border-gray-700'} flex flex-col items-center shadow-lg relative`}>
            {pkg.bestValue && (
              <div className="absolute top-0 -translate-y-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">EN İYİ DEĞER</div>
            )}
            <h2 className="text-2xl font-bold text-green-400">{pkg.name}</h2>
            <p className="text-gray-400 text-sm mb-4 h-10 flex items-center">{pkg.description}</p>
            <p className="text-5xl font-extrabold text-white my-4">{pkg.credits}</p>
            <p className="text-lg text-gray-300 mb-6">Kredi</p>
            <button
              onClick={() => handlePurchase(pkg)}
              disabled={loadingPackage === pkg.id}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-wait"
            >
              <StoreIcon className="w-5 h-5"/>
              {loadingPackage === pkg.id ? 'Yönlendiriliyor...' : `${pkg.price} TL - Satın Al`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseCreditsPage;