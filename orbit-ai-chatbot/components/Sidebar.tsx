import React from 'react';
import { ChatSession, Personality, PERSONALITIES } from '../types';
import BotIcon from './BotIcon';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  currentPersonality: Personality;
  onSelectPersonality: (p: Personality) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDarkMode: boolean;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  currentPersonality,
  onSelectPersonality,
  isMobileOpen,
  setIsMobileOpen,
  isDarkMode,
  onOpenSettings
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-20 transition-opacity lg:hidden ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <aside className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform lg:translate-x-0 lg:static transition-colors duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BotIcon className="w-8 h-8" />
              <h1 className="text-xl text-slate-800 dark:text-white font-aqua">Orbit</h1>
            </div>
            <button 
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition-colors"
              title="Settings"
            >
              <i className="fas fa-cog"></i>
            </button>
          </div>

          {/* New Chat Button - Prominent Styling */}
          <div className="p-4">
            <button 
              onClick={() => { onNewChat(); setIsMobileOpen(false); }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none font-bold tracking-tight hover:scale-[1.02] active:scale-95"
            >
              <i className="fas fa-plus-circle text-lg"></i>
              <span>New Chat</span>
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">History</h2>
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <div className="px-2 py-4 text-sm text-slate-400 text-center italic">
                  No previous chats
                </div>
              ) : (
                sessions.map(session => (
                  <div 
                    key={session.id}
                    className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      currentSessionId === session.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    onClick={() => { onSelectSession(session.id); setIsMobileOpen(false); }}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <i className="fas fa-message opacity-50 text-xs"></i>
                      <span className="text-sm truncate font-medium">{session.title || 'Untitled Chat'}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-opacity"
                    >
                      <i className="fas fa-trash-can text-xs"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Personality Selection */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Personality</h2>
            <div className="grid grid-cols-1 gap-2">
              {PERSONALITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectPersonality(p)}
                  className={`flex items-center space-x-3 p-2 rounded-lg text-sm transition-all ${
                    currentPersonality.id === p.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {p.id === 'orbit' ? (
                      <BotIcon className="w-full h-full" />
                    ) : (
                      <i className={`fas ${p.icon} text-center`}></i>
                    )}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="font-medium truncate">{p.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;