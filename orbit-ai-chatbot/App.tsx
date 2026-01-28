
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession, Personality, PERSONALITIES, Role, MessageImage } from './types';
import { geminiService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';
import BotIcon from './components/BotIcon';
import SettingsModal from './components/SettingsModal';
import EmojiPicker from './components/EmojiPicker';

const App: React.FC = () => {
  // --- State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [pendingFile, setPendingFile] = useState<MessageImage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [personality, setPersonality] = useState<Personality>(PERSONALITIES[0]);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // --- Initial Load ---
  useEffect(() => {
    const savedSessions = localStorage.getItem('orbit_sessions');
    const savedMode = localStorage.getItem('orbit_dark_mode');
    
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
        const savedPersonality = PERSONALITIES.find(p => p.id === parsed[0].personalityId);
        if (savedPersonality) setPersonality(savedPersonality);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }

    if (savedMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('orbit_sessions', JSON.stringify(sessions));
    } else {
        localStorage.removeItem('orbit_sessions');
    }
  }, [sessions]);

  // --- Scroll to Bottom ---
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, isTyping, scrollToBottom]);

  // --- File Processing ---
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setPendingFile({
        data: base64,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // --- Drag & Drop Handlers ---
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // --- Paste Handler ---
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
        }
      }
    }
  }, [processFile]);

  // --- Chat Handlers ---
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      personalityId: personality.id
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id && filtered.length > 0) {
      setCurrentSessionId(filtered[0].id);
    } else if (filtered.length === 0) {
      createNewChat();
    }
  };

  const clearAllHistory = () => {
    setSessions([]);
    localStorage.removeItem('orbit_sessions');
    createNewChat();
  };

  const selectSession = (id: string) => {
    setCurrentSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      const p = PERSONALITIES.find(pers => pers.id === session.personalityId);
      if (p) setPersonality(p);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('orbit_dark_mode', newMode.toString());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = inputText;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + emoji + after;
      setInputText(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setInputText(prev => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const handleSend = async () => {
    const hasInput = inputText.trim() || pendingFile;
    if (!hasInput || isTyping) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
      image: pendingFile || undefined
    };

    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        const newMessages = [...s.messages, userMessage];
        const newTitle = s.messages.length === 0 ? inputText.slice(0, 30) + (inputText.length > 30 ? '...' : '') : s.title;
        return { ...s, messages: newMessages, title: newTitle || 'Shared an image' };
      }
      return s;
    });

    setSessions(updatedSessions);
    const textToSend = inputText;
    const fileToSend = pendingFile;
    
    setInputText('');
    setPendingFile(null);
    setIsTyping(true);
    setShowEmojiPicker(false);

    try {
      const history = currentSession?.messages || [];
      const stream = geminiService.sendMessageStream(personality, history, textToSend, fileToSend || undefined);

      let modelText = "";
      const modelMessageId = uuidv4();
      const modelMessage: Message = {
        id: modelMessageId,
        role: 'model',
        text: "",
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, modelMessage] };
        }
        return s;
      }));

      for await (const chunk of stream) {
        modelText += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            const msgs = s.messages.map(m => 
              m.id === modelMessageId ? { ...m, text: modelText } : m
            );
            return { ...s, messages: msgs };
          }
          return s;
        }));
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div 
      className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-600/10 dark:bg-indigo-400/10 backdrop-blur-sm pointer-events-none border-4 border-dashed border-indigo-500 m-4 rounded-3xl animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-indigo-100 dark:border-indigo-900">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center animate-bounce">
              <i className="fas fa-cloud-arrow-up text-3xl"></i>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-white">Drop your image here</p>
            <p className="text-sm text-slate-500">Orbit will analyze it for you</p>
          </div>
        </div>
      )}

      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
        currentPersonality={personality}
        onSelectPersonality={setPersonality}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isDarkMode={isDarkMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onClearHistory={clearAllHistory}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 transition-colors duration-300">
          <div className="flex items-center space-x-3 overflow-hidden">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="flex items-center justify-center w-10 h-10 overflow-hidden">
              {personality.id === 'orbit' ? (
                <BotIcon className="w-full h-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <i className={`fas ${personality.icon}`}></i>
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-xl text-slate-800 dark:text-white truncate font-aqua">
                Orbit
              </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 rounded text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold uppercase tracking-widest hidden sm:block">
              Online
            </div>
          </div>
        </header>

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
        >
          {currentSession?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="mb-4 animate-bounce">
                {personality.id === 'orbit' ? (
                  <BotIcon className="w-20 h-20" />
                ) : (
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <i className={`fas ${personality.icon} text-3xl`}></i>
                  </div>
                )}
              </div>
              <h3 className="text-2xl mb-2 text-slate-800 dark:text-white font-aqua">Orbit</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                I'm {personality.name}, {personality.description.toLowerCase()} How can I help you today?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-lg">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-sm text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-3"
                >
                  <span className="text-xl">📸</span> Analyze an image
                </button>
                <button 
                  onClick={() => setInputText("How do I use React hooks properly?")}
                  className="p-3 text-sm text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-3"
                >
                  <span className="text-xl">💻</span> Technical help
                </button>
              </div>
            </div>
          ) : (
            currentSession?.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}
          
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0 transition-colors duration-300">
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            
            {pendingFile && (
              <div className="flex px-4 py-2 animate-in slide-in-from-bottom-2 duration-200">
                <div className="relative group">
                  <img 
                    src={`data:${pendingFile.mimeType};base64,${pendingFile.data}`} 
                    className="w-20 h-20 object-cover rounded-xl border-2 border-indigo-500 shadow-md transition-transform group-hover:scale-105"
                    alt="Upload preview"
                  />
                  <button 
                    onClick={() => setPendingFile(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              </div>
            )}

            <div className="relative flex items-end gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="h-[52px] w-[52px] flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-500 dark:hover:border-indigo-800 transition-all shrink-0 shadow-sm hover:scale-105 active:scale-95"
                title="Upload image (or drag & drop)"
              >
                <i className="fas fa-paperclip text-xl"></i>
              </button>

              <div className="relative flex-1 group">
                {showEmojiPicker && (
                  <EmojiPicker 
                    onSelect={handleEmojiSelect} 
                    onClose={() => setShowEmojiPicker(false)} 
                  />
                )}
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onPaste={handlePaste}
                  placeholder="Message Orbit..."
                  rows={1}
                  className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-all resize-none shadow-sm group-hover:shadow-md max-h-48"
                  style={{ height: 'auto', minHeight: '52px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                />
                <div className="absolute right-3 bottom-3 flex space-x-2">
                  <button 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`transition-colors p-1 rounded-lg ${showEmojiPicker ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="Emoji support"
                  >
                    <i className="far fa-face-smile text-lg"></i>
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleSend}
                disabled={(!inputText.trim() && !pendingFile) || isTyping}
                className={`h-[52px] w-[52px] flex items-center justify-center rounded-2xl transition-all shrink-0 ${
                  (inputText.trim() || pendingFile) && !isTyping 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-y-0 scale-100 hover:scale-105 active:scale-95' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed scale-95'
                }`}
              >
                <i className={`fas ${isTyping ? 'fa-circle-notch fa-spin' : 'fa-paper-plane'} text-xl`}></i>
              </button>
            </div>
          </div>
          <div className="text-[10px] text-center text-slate-400 mt-3 leading-tight opacity-70 group hover:opacity-100 transition-opacity">
            <p>Made By Muhammad Zeeshan</p>
            <p>Powered by Gemini API</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
