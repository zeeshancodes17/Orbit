
import React, { useState } from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  return (
    <div className={`flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`relative group max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base ${
        isUser 
          ? 'bg-indigo-600 text-white rounded-tr-none' 
          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
      }`}>
        {/* Copy Button */}
        <button 
          onClick={handleCopy}
          className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${
            isUser 
              ? 'hover:bg-white/20 text-white/80' 
              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500'
          }`}
          title="Copy message"
        >
          <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} text-xs`}></i>
        </button>

        {message.image && (
          <div className="mb-2 overflow-hidden rounded-xl">
            <img 
              src={`data:${message.image.mimeType};base64,${message.image.data}`} 
              alt="Uploaded content" 
              className="max-w-full h-auto object-cover max-h-60"
            />
          </div>
        )}

        <div className="whitespace-pre-wrap leading-relaxed pr-6">
          {message.text}
        </div>
        <div className={`text-[10px] mt-1 opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
