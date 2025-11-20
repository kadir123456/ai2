import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 shadow-lg bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Maç Tahmin Yapay Zekası
        </h1>
      </div>
    </header>
  );
};

export default Header;