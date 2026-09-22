import React from 'react';

interface PixelPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dialog';
}

export const PixelPanel: React.FC<PixelPanelProps> = ({ children, className = '', variant = 'primary' }) => {
  let bg = 'bg-[var(--color-sun)]';
  let border = 'border-[var(--color-blue-deep)]';
  
  if (variant === 'secondary') {
    bg = 'bg-[var(--color-cyan)]';
    border = 'border-[var(--color-blue-deep)]';
  } else if (variant === 'dialog') {
    bg = 'bg-white';
    border = 'border-[var(--color-ink)]';
  }

  return (
    <div className={`pixel-corners border-4 ${bg} ${border} p-4 pixel-shadow ${className}`}>
      {children}
    </div>
  );
};
