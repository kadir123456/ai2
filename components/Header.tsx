import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginIcon, LogoutIcon, UserAddIcon, WalletIcon, StoreIcon } from './IconComponents';

const Header: React.FC = () => {
  const { currentUser, logout, balance } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Giriş ve Kayıt sayfalarında header'ı tamamen gizle
  const hideHeader = ['/login', '/register'].includes(location.pathname);
  
  if (hideHeader) return null;

  return (
    <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-base md:text-lg font-bold text-white hidden sm:inline">
              Maç Tahmin AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          {currentUser && (
            <nav className="hidden lg:flex items-center gap-6 flex-1 justify-center">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Görsel Analiz
              </Link>
              <Link 
                to="/newsletter" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Bülten
              </Link>
              <Link 
                to="/purchase-credits" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Krediler
              </Link>
              <Link 
                to="/profile" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Profil
              </Link>
            </nav>
          )}

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                {/* Balance Card - Compact */}
                <div className="flex items-center gap-2 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700">
                  <WalletIcon className="w-5 h-5 text-green-400" />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">Bakiye:</span>
                    <span className="font-bold text-green-400 text-sm">
                      {balance !== null ? balance : '...'}
                    </span>
                  </div>
                </div>

                {/* Buy Credits Button */}
                <Link 
                  to="/" 
                  className="block px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Görsel Analiz
                </Link>
                <Link 
                  to="/newsletter" 
                  className="block px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bülten
                </Link>
                <Link 
                  to="/purchase-credits" 
                  className="block px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Krediler
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profil
                </Link>
                
                <div className="border-t border-gray-800 my-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 bg-red-600/90 hover:bg-red-600 px-4 py-2.5 rounded-lg text-white font-medium transition-colors"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
                <Link 
                  to="/register" 
                  className="block px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 
                  to="/purchase-credits" 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm"
                >
                  <StoreIcon className="w-4 h-4" />
                  <span>Kredi Yükle</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600/90 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm"
                >
                  <LogoutIcon className="w-4 h-4" />
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <LoginIcon className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <UserAddIcon className="w-4 h-4" />
                  <span>Kayıt Ol</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Balance + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <div className="flex items-center gap-1.5 bg-gray-800/60 px-2.5 py-1.5 rounded-lg border border-gray-700">
                <WalletIcon className="w-4 h-4 text-green-400" />
                <span className="font-bold text-green-400 text-xs">
                  {balance !== null ? balance : '...'}
                </span>
              </div>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 space-y-2">
            {currentUser ? (
              <>
                <Link
