import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img 
        src="/tachleslogo-removebg-preview.png" 
        alt="TachlesAI Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;