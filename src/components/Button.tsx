import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';
  
  const variantStyles = {
    primary: 'bg-[#4A6FA5] text-white active:bg-[#3a5a8a]',
    secondary: 'bg-white text-[#4A6FA5] border-2 border-[#4A6FA5] active:bg-[#F5F7FA]',
    danger: 'bg-[#E53E3E] text-white active:bg-[#c53030]',
    success: 'bg-[#38A169] text-white active:bg-[#2f855a]',
    warning: 'bg-[#F6AD55] text-white active:bg-[#ed8936]',
  };
  
  const sizeStyles = {
    small: 'h-10 px-4 text-sm',
    medium: 'h-12 px-6',
    large: 'h-14 px-8 text-lg',
  };
  
  const widthStyle = fullWidth ? 'w-full' : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
    >
      {children}
    </button>
  );
}
