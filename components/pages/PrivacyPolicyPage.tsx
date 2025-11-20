import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl bg-gray-800/50 p-8 rounded-lg border border-gray-700 text-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-white">Gizlilik Politikası</h1>
      <div className="space-y-4 prose prose-invert">
        <p>Son güncelleme: 24 Mayıs 2024</p>
        <p>
          Bu Gizlilik Politikası, Hizmetimizi kullandığınızda bilgilerinizin toplanması,
          kullanılması ve ifşa edilmesi ile ilgili politikalarımızı ve prosedürlerimizi
          açıklar ve gizlilik haklarınızı ve yasaların sizi nasıl koruduğunu size anlatır.
        </p>
        <h2 className="text-2xl font-semibold text-white">Veri Toplama ve Kullanma</h2>
        <p>
          Hizmetimizi kullanırken, sizinle iletişim kurmak veya sizi tanımlamak için
          kullanılabilecek belirli kişisel olarak tanımlanabilir bilgileri bize
          sağlamanızı isteyebiliriz. Kişisel olarak tanımlanabilir bilgiler şunları
          içerebilir, ancak bunlarla sınırlı değildir: E-posta adresi, Kullanım Verileri.
        </p>
        <h2 className="text-2xl font-semibold text-white">Kullanım Verileri</h2>
        <p>
          Kullanım Verileri, Hizmeti kullanırken otomatik olarak toplanır. Kullanım
          Verileri, Cihazınızın İnternet Protokol adresi (ör. IP adresi), tarayıcı
          türü, tarayıcı sürümü, ziyaret ettiğiniz Hizmetimizin sayfaları, ziyaretinizin
          saati ve tarihi, bu sayfalarda geçirilen süre, benzersiz cihaz
          tanımlayıcıları ve diğer teşhis verileri gibi bilgileri içerebilir.
        </p>
        {/* Daha fazla içerik buraya eklenebilir */}
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;