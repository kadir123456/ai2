
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="text-center p-8">
      <div className="flex justify-center items-center mb-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
      <p className="text-lg font-semibold text-gray-300">{message}</p>
    </div>
  );
};

export default Loader;
