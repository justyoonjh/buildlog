import React from 'react';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, actionLabel, onAction, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white rounded-lg border border-slate-100 border-dashed relative p-6">
      {icon && <div className="mb-2 opacity-30">{icon}</div>}
      <div className="text-center">
        <p>{message}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="mt-4 px-6 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg text-sm hover:bg-blue-100 transition-colors"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
