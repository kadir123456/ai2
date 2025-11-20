import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="w-full text-center p-4 text-gray-500 text-xs mt-auto">
            <div className="mb-2">
                <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors mx-2">Gizlilik Politikası</Link>
                |
                <Link to="/terms-of-service" className="hover:text-gray-300 transition-colors mx-2">Hizmet Şartları</Link>
            </div>
            <p>Tahminler yapay zeka tarafından oluşturulmuştur ve garanti edilmez. Tahminler sadece referans amaçlıdır. Lütfen sorumlu davranın.</p>
            <p>&copy; 2024 Maç Tahmin Yapay Zekası. Tüm hakları saklıdır.</p>
        </footer>
    );
}

export default Footer;