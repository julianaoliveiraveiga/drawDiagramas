import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({
  label,
  error,
  helpText,
  required,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="form-group">
      {label && (
        <label className={`label ${required ? 'label-required' : ''}`}>
          {label}
        </label>
      )}
      <input
        className={`input ${error ? 'input-error' : ''} ${className}`}
        required={required}
        {...props}
      />
      {helpText && !error && (
        <p className="text-sm text-seplag-muted mt-1">{helpText}</p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  helpText,
  required,
  options,
  placeholder = 'Selecione...',
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="form-group">
      {label && (
        <label className={`label ${required ? 'label-required' : ''}`}>
          {label}
        </label>
      )}
      <select
        className={`input ${error ? 'input-error' : ''} ${className}`}
        required={required}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helpText && !error && (
        <p className="text-sm text-seplag-muted mt-1">{helpText}</p>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  maxLength?: number;
  showCount?: boolean;
}

export function Textarea({
  label,
  error,
  helpText,
  required,
  maxLength,
  showCount = false,
  value,
  className = '',
  ...props
}: TextareaProps) {
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <div className="form-group">
      {label && (
        <label className={`label ${required ? 'label-required' : ''}`}>
          {label}
        </label>
      )}
      <textarea
        className={`input min-h-[100px] ${error ? 'input-error' : ''} ${className}`}
        required={required}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      <div className="flex justify-between mt-1">
        {helpText && !error && (
          <p className="text-sm text-seplag-muted">{helpText}</p>
        )}
        {showCount && maxLength && (
          <p className={`text-sm ${charCount >= maxLength ? 'text-seplag-danger' : 'text-seplag-muted'}`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
