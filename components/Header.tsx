import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginIcon, LogoutIcon, UserAddIcon, WalletIcon, StoreIcon } from './IconComponents';

const Header: React.FC = () => {
  const { currentUser, logout, balance } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const showAuthButtons = !['/login', '/register'].includes(location.pathname);

  return (
    <header className="p-4 shadow-lg bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Maç Tahmin Yapay Zekası
            </h1>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          {currentUser ? (
            <>
              <div className="flex items-center gap-3 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700">
                <WalletIcon className="w-7 h-7 text-green-400 flex-shrink-0" />
                <div>
                  <span className="text-xs text-gray-400 block">Bakiye</span>
                  <p className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-400 text-lg leading-tight">
                    {balance !== null ? balance : '...'} Kredi
                  </p>
                </div>
              </div>
              <Link to="/purchase-credits" className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 px-3 py-2 rounded-lg text-white font-semibold transition-colors text-sm md:text-base h-full">
                <StoreIcon className="w-5 h-5" />
                <span className="hidden md:inline">Kredi Yükle</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 px-3 py-2 rounded-lg text-white font-semibold transition-colors text-sm md:text-base h-full"
              >
                <LogoutIcon className="w-5 h-5" />
                <span className="hidden md:inline">Çıkış Yap</span>
              </button>
            </>
          ) : (
            showAuthButtons && (
              <>
                <Link to="/login" className="flex items-center gap-2 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm md:text-base">
                  <LoginIcon className="w-5 h-5"/>
                  <span className="hidden md:inline">Giriş Yap</span>
                </Link>
                <Link to="/register" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm md:text-base">
                  <UserAddIcon className="w-5 h-5"/>
                  <span>Kayıt Ol</span>
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;