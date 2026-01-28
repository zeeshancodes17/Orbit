
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-1.5 items-center px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl w-fit shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-dot-pulse"></div>
      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-dot-pulse dot-2"></div>
      <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-dot-pulse dot-3"></div>
    </div>
  );
};

export default TypingIndicator;
