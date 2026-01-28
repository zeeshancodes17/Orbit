
import React from 'react';

interface BotIconProps {
  className?: string;
}

const BotIcon: React.FC<BotIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <div className={`${className} flex items-center justify-center overflow-hidden`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background rounded square */}
        <rect x="5" y="5" width="90" height="90" rx="22" fill="#E1F5FE" stroke="#0288D1" strokeWidth="6"/>
        
        {/* Robot head rectangle */}
        <rect x="24" y="32" width="52" height="34" rx="8" fill="#0288D1"/>
        
        {/* Eyes */}
        <circle cx="40" cy="49" r="6" fill="#E1F5FE"/>
        <circle cx="60" cy="49" r="6" fill="#E1F5FE"/>
        
        {/* Pedestal/Base */}
        <rect x="42" y="66" width="16" height="8" rx="2" fill="#0288D1"/>
      </svg>
    </div>
  );
};

export default BotIcon;
