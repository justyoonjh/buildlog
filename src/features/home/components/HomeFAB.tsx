import React from 'react';
import { Plus } from 'lucide-react';

interface HomeFABProps {
  onClick: () => void;
}

export const HomeFAB: React.FC<HomeFABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-6 right-4 z-20 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
    >
      <Plus size={32} />
    </button>
  );
};
