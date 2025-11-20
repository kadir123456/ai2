import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.');
    } catch (err: any) {
      setError('E-posta gönderilemedi. Lütfen girdiğiniz adresin doğru olduğundan emin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-gray-800/50 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Şifremi Unuttum</h2>
        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
        {message && <p className="bg-green-900/50 text-green-300 p-3 rounded-md mb-4 text-center">{message}</p>}
        
        {!message && (
          <>
            <p className="text-center text-gray-400 text-sm mb-6">
              Kayıtlı e-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı göndereceğiz.
            </p>
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
            <div className="flex items-center justify-between">
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-500"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </button>
            </div>
          </>
        )}
        
        <p className="text-center text-gray-400 text-sm mt-6">
          <Link to="/login" className="font-bold text-green-400 hover:text-green-300">
            Giriş sayfasına geri dön
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;