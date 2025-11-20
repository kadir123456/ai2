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
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">MT</span>
            </div>
            <span className="text-sm font-bold text-white hidden sm:inline whitespace-nowrap">
              Maç Tahmin AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          {currentUser && (
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              <Link 
                to="/" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
              >
                Görsel Analiz
              </Link>
              <Link 
                to="/purchase-credits" 
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap"
              >
                Krediler
              </Link>
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                {/* Balance Card - Kompakt ve okunabilir */}
                <div className="flex items-center gap-2 bg-gray-800/70 px-2.5 py-2 rounded-lg border border-gray-700 flex-shrink-0 min-w-fit">
                  <WalletIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-green-400 text-base tabular-nums">
                      {balance !== null ? balance : '...'}
                    </span>
                    <span className="text-xs text-gray-400">kredi</span>
                  </div>
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-2">
                  <Link 
                    to="/purchase-credits" 
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm whitespace-nowrap"
                  >
                    <StoreIcon className="w-4 h-4" />
                    <span>Kredi Yükle</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-600/90 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-medium transition-colors text-sm whitespace-nowrap"
                  >
                    <LogoutIcon className="w-4 h-4" />
                    <span>Çıkış</span>
                  </button>
                </div>

                {/* Mobile Hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-300 hover:text-white transition-colors flex-shrink-0"
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
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  <LoginIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Giriş</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
                >
                  <UserAddIcon className="w-4 h-4" />
                  <span>Kayıt Ol</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && currentUser && (
          <div className="md:hidden border-t border-gray-800 py-3 space-y-1 animate-fadeIn">
            <Link 
              to="/" 
              className="block px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              📊 Görsel Analiz
            </Link>
            <Link 
              to="/purchase-credits" 
              className="block px-4 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              💳 Kredi Yükle
            </Link>
            
            <div className="border-t border-gray-800 my-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 bg-red-600/90 hover:bg-red-600 px-4 py-2.5 rounded-lg text-white font-medium transition-colors text-sm"
              >
                <LogoutIcon className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
