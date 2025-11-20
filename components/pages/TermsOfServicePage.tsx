import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-white">Hizmet Şartları</h1>
      <div className="space-y-4 prose prose-invert">
        <p>Son güncelleme: 24 Mayıs 2024</p>
        <p>
          Lütfen hizmetimizi kullanmadan önce bu hizmet şartlarını dikkatlice okuyun.
        </p>
        <h2 className="text-2xl font-semibold text-white">Hesaplar</h2>
        <p>
          Bizde bir hesap oluşturduğunuzda, bize her zaman doğru, eksiksiz ve güncel
          bilgiler sağlamalısınız. Bunu yapmamak, Şartların ihlali anlamına gelir ve
          Hizmetimizdeki hesabınızın derhal feshedilmesine neden olabilir.
        </p>
        <p>
          Hizmete erişmek için kullandığınız şifreyi korumaktan ve şifreniz altındaki
          tüm faaliyetlerden veya eylemlerden siz sorumlusunuz. Şifrenizi herhangi bir
          üçüncü tarafa açıklamama konusunda anlaşırsınız. Güvenlik ihlali veya
          hesabınızın yetkisiz kullanımı hakkında bilgi sahibi olduğunuzda derhal
          bize bildirmelisiniz.
        </p>
        {/* Daha fazla içerik buraya eklenebilir */}
      </div>
    </div>
  );
};

export default TermsOfServicePage;