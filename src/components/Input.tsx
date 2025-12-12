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
  return (
    <div className="form-row">
      {label && <label className="form-label">{label}</label>}

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`input input--textarea`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`input`}
        />
      )}
    </div>
  );
}