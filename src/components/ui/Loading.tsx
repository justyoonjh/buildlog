import React from 'react';

export const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 text-sm font-medium">로딩 중...</p>
    </div>
  );
};
