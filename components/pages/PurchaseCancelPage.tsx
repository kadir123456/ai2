import React from 'react';
import { Link } from 'react-router-dom';

const PurchaseCancelPage: React.FC = () => {
  return (
    <div className="text-center p-8 w-full max-w-lg bg-yellow-900/20 border border-yellow-500 rounded-lg">
       <div className="flex justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Ödeme İptal Edildi</h1>
      <p className="text-gray-300 mb-6">
        Ödeme işlemi tamamlanmadı veya bir sorun oluştu. Kredileriniz hesabınıza eklenmedi.
      </p>
      <div className="flex justify-center gap-4">
        <Link
            to="/purchase-credits"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 inline-block"
        >
            Tekrar Dene
        </Link>
        <Link
            to="/"
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 inline-block"
        >
            Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default PurchaseCancelPage;