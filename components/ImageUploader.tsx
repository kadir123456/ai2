import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './IconComponents';

interface ImageUploaderProps {
  onAnalyze: (imageData: string) => void;
  isDisabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onAnalyze, isDisabled }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleAnalyzeClick = useCallback(() => {
    if (imagePreview && !isDisabled) {
      const base64Data = imagePreview.split(',')[1];
      onAnalyze(base64Data);
    }
  }, [imagePreview, onAnalyze, isDisabled]);

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="w-full max-w-lg text-center p-8 bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-2xl shadow-lg">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />

      {!imagePreview ? (
        <div onClick={triggerFileSelect} className="cursor-pointer">
          <div className="flex justify-center items-center mb-4">
            <div className="p-4 bg-gray-700 rounded-full">
              <UploadIcon className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Maç Kuponunuzu Yükleyin</h2>
          <p className="text-gray-400">Bir resim seçmek için buraya tıklayın</p>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG, veya WEBP</p>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-semibold mb-4">Resim Önizleme</h3>
          <img src={imagePreview} alt="Match slip preview" className="max-w-full max-h-64 mx-auto rounded-lg mb-6 border-2 border-gray-500" />
          <div className="flex justify-center gap-4">
            <button
                onClick={triggerFileSelect}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
            >
                Resmi Değiştir
            </button>
            <button
              onClick={handleAnalyzeClick}
              disabled={isDisabled}
              className={`text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md ${
                isDisabled
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              Analiz Et ve Tahmin Yap
            </button>
          </div>
          {isDisabled && <p className="text-red-400 text-sm mt-4">Analiz için krediniz kalmadı.</p>}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;