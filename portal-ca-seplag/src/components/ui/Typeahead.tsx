import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

// ============================================
// OCOR01.01 - TYPEAHEAD/AUTOCOMPLETE OTIMIZADO
// Para seleção de localização com 1000+ itens
// ============================================

interface TypeaheadOption {
  id: string;
  label: string;
  description?: string;
}

interface TypeaheadProps {
  options: TypeaheadOption[];
  value: TypeaheadOption | null;
  onChange: (option: TypeaheadOption | null) => void;
  onSearch: (query: string) => Promise<TypeaheadOption[]>;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  maxResults?: number;
}

export function Typeahead({
  options: initialOptions,
  value,
  onChange,
  onSearch,
  placeholder = 'Digite para buscar...',
  label,
  required = false,
  disabled = false,
  error,
  maxResults = 20,
}: TypeaheadProps) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<TypeaheadOption[]>(initialOptions);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Buscar opções quando o usuário digita
  useEffect(() => {
    const searchOptions = async () => {
      if (query.length < 2) {
        setOptions(initialOptions.slice(0, maxResults));
        return;
      }

      setIsLoading(true);
      try {
        const results = await onSearch(query);
        setOptions(results.slice(0, maxResults));
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchOptions, 300);
    return () => clearTimeout(debounce);
  }, [query, onSearch, initialOptions, maxResults]);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && options[activeIndex]) {
          handleSelect(options[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleSelect = (option: TypeaheadOption) => {
    onChange(option);
    setQuery(option.label);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setOptions(initialOptions.slice(0, maxResults));
    inputRef.current?.focus();
  };

  return (
    <div className="typeahead-container">
      {label && (
        <label className={`label ${required ? 'label-required' : ''}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <span className="spinner h-4 w-4" />
          ) : (
            <Search className="h-4 w-4 text-seplag-muted" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`input pl-10 pr-10 ${error ? 'input-error' : ''}`}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-seplag-muted hover:text-seplag-dark" />
          </button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {isOpen && options.length > 0 && (
        <ul ref={listRef} className="typeahead-dropdown">
          {options.map((option, index) => (
            <li
              key={option.id}
              onClick={() => handleSelect(option)}
              className={`
                typeahead-item
                ${index === activeIndex ? 'typeahead-item-active' : ''}
              `}
            >
              <p className="font-medium">{option.label}</p>
              {option.description && (
                <p className="text-xs text-seplag-muted">{option.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.length >= 2 && options.length === 0 && !isLoading && (
        <div className="typeahead-dropdown">
          <p className="px-4 py-3 text-sm text-seplag-muted">
            Nenhum resultado encontrado.
          </p>
        </div>
      )}
    </div>
  );
}
