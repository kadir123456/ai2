import React from 'react';
import { Link } from 'react-router-dom';

const PurchaseSuccessPage: React.FC = () => {
  return (
    <div className="text-center p-8 w-full max-w-lg bg-green-900/20 border border-green-500 rounded-lg">
      <div className="flex justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Ödeme Başarılı!</h1>
      <p className="text-gray-300 mb-6">
        Kredileriniz başarıyla hesabınıza eklendi. Şimdi yeni analizler yapmaya başlayabilirsiniz.
      </p>
      <Link
        to="/"
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 inline-block"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default PurchaseSuccessPage;