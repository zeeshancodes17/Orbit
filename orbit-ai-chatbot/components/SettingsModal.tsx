
import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onClearHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-indigo-900/30 text-amber-600 dark:text-indigo-400 flex items-center justify-center">
                <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'}`}></i>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">Appearance</p>
                <p className="text-xs text-slate-500">Switch between light and dark themes</p>
              </div>
            </div>
            <button 
              onClick={onToggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isDarkMode ? 'translate-x-6' : ''}`}></div>
            </button>
          </div>

          {/* Clear History Setting */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                <i className="fas fa-trash-alt"></i>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">Clear History</p>
                <p className="text-xs text-slate-500">Delete all your conversations permanently</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                  onClearHistory();
                  onClose();
                }
              }}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl text-sm font-semibold transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Orbit Version 1.2.0<br />
              Made By Muhammad Zeeshan<br />
              Based on Gemini API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
