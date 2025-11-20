import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError('Bu e-posta adresi zaten kullanılıyor.');
        } else if (err.code === 'auth/weak-password') {
            setError('Şifre en az 6 karakter olmalıdır.');
        } else {
            setError('Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
        }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-gray-800/50 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Hesap Oluştur</h2>
        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            E-posta
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
            id="email"
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Şifre
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="confirm-password">
            Şifreyi Onayla
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
            id="confirm-password"
            type="password"
            placeholder="******************"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-500"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </div>
        <p className="text-center text-gray-400 text-sm mt-6">
          Zaten bir hesabınız var mı?{' '}
          <Link to="/login" className="font-bold text-green-400 hover:text-green-300">
            Giriş Yapın
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;