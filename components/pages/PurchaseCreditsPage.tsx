// components/pages/PurchaseCreditsPage.tsx
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
  { 
    id: 'p_trial', 
    name: 'Deneme Paketi', 
    credits: 5, 
    price: 30, 
    description: 'Sistemi denemek için ideal.' 
  },
  { 
    id: 'p_standard', 
    name: 'Standart Paket', 
    credits: 25, 
    price: 125, 
    description: 'Düzenli kullanıcılar için.', 
    bestValue: true 
  },
  { 
    id: 'p_pro', 
    name: 'Profesyonel Paket', 
    credits: 75, 
    price: 300, 
    description: 'Yoğun analizler için en iyisi.' 
  },
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
      console.log('🔄 Token yenileniyor...');
      const token = await currentUser.getIdToken(true);
      console.log('✅ Token hazır');
      
      console.log('💳 Ödeme başlatılıyor:', pkg.name);
      
      const response = await fetch('/.netlify/functions/start-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      console.log('📡 Response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Hata:', errorData);
        
        if (response.status === 401) {
          throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status === 500) {
          throw new Error(errorData.error || 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        } else {
          throw new Error(errorData.error || 'Ödeme başlatılamadı.');
        }
      }

      const data = await response.json();
      console.log('✅ Yanıt alındı:', data);
      
      // Test mode - direkt yönlendir
      if (data.testMode && data.paymentUrl) {
        console.log('🚀 Test mode yönlendirme...');
        window.location.href = data.paymentUrl;
        return;
      }

      // Production - HTML formu işle
      if (data.paymentHtml) {
        console.log('📄 Shopier formu işleniyor...');
        
        // Geçici div oluştur
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.paymentHtml;
        document.body.appendChild(tempDiv);
        
        // Formu bul ve submit et
        const form = tempDiv.querySelector('form') as HTMLFormElement;
        if (form) {
          console.log('✅ Form bulundu, submit ediliyor...');
          form.submit();
        } else {
          console.error('❌ Form bulunamadı');
          throw new Error('Ödeme formu bulunamadı.');
        }
      } else if (data.paymentUrl) {
        console.log('🚀 URL yönlendirme...');
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Ödeme bilgisi alınamadı.');
      }
    } catch (err) {
      console.error('❌ Satın alma hatası:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
      setLoadingPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8 md:py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Kredi Paketleri
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Analiz yapmaya devam etmek için size uygun paketi seçin
          </p>
        </div>
        
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center backdrop-blur-sm">
            <p className="text-sm md:text-base">{error}</p>
          </div>
        )}
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`bg-gray-800/70 backdrop-blur-sm p-6 md:p-8 rounded-2xl border-2 ${
                pkg.bestValue ? 'border-green-500 shadow-xl shadow-green-500/20' : 'border-gray-700'
              } flex flex-col items-center hover:transform hover:scale-105 transition-all duration-300 relative`}
            >
              {pkg.bestValue && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  EN İYİ DEĞER
                </div>
              )}
              
              <h2 className="text-xl md:text-2xl font-bold text-green-400 mt-2">
                {pkg.name}
              </h2>
              
              <p className="text-gray-400 text-xs md:text-sm mb-6 mt-2 h-10 flex items-center text-center">
                {pkg.description}
              </p>
              
              <div className="my-6">
                <p className="text-4xl md:text-5xl font-extrabold text-white">
                  {pkg.credits}
                </p>
                <p className="text-base md:text-lg text-gray-300 mt-2">
                  Kredi
                </p>
              </div>
              
              <div className="w-full mt-auto">
                <div className="text-center mb-4">
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {pkg.price} ₺
                  </span>
                </div>
                
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={loadingPackage === pkg.id}
                  className={`w-full ${
                    pkg.bestValue 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg`}
                >
                  {loadingPackage === pkg.id ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Yönlendiriliyor...</span>
                    </>
                  ) : (
                    <>
                      <StoreIcon className="w-5 h-5" />
                      <span>Satın Al</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs md:text-sm text-gray-500">
            Güvenli ödeme Shopier altyapısı ile sağlanmaktadır
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCreditsPage;
