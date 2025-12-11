import React from 'react';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

export function Input({
  value,
  onChange,
  placeholder,
  label,
  multiline = false,
  rows = 3,
  disabled = false,
}: InputProps) {
  const baseStyles = 'w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#4A6FA5] focus:outline-none transition-colors bg-white text-[#2D3748] placeholder:text-[#718096]';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm text-[#2D3748]">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`${baseStyles} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={baseStyles}
        />
      )}
    </div>
  );
}
