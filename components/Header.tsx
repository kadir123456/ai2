import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginIcon, LogoutIcon, UserAddIcon, WalletIcon } from './IconComponents';

const Header: React.FC = () => {
  const { currentUser, logout, balance } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="p-4 shadow-lg bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Maç Tahmin Yapay Zekası
            </h1>
        </Link>
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                <WalletIcon className="w-6 h-6 text-green-400" />
                <span className="font-bold text-white">{balance !== null ? balance : '...'} Kredi</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold transition-colors"
              >
                <LogoutIcon className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-2 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                <LoginIcon className="w-5 h-5"/>
                <span>Giriş Yap</span>
              </Link>
              <Link to="/register" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                <UserAddIcon className="w-5 h-5"/>
                <span>Kayıt Ol</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;