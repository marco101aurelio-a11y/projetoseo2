import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={cn(
        "flex items-center glass-panel px-4 sm:px-6 py-1 transition-all border border-transparent",
        isFocused ? "ring-2 ring-slate-400/20 border-slate-300 dark:border-slate-600 shadow-md" : ""
      )}>
        <Search className={cn(
          "w-5 h-5 transition-colors",
          isFocused ? "text-slate-900 dark:text-white" : "text-slate-400"
        )} />
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Digite a palavra-chave, domínio ou URL..."
          className="flex-1 py-3 sm:py-4 px-2 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-base sm:text-lg min-w-0"
          disabled={isLoading}
        />
        
        <div className="pr-2 sm:pr-3 pl-1 sm:pl-2">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="premium-button py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1 sm:gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Buscar</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </form>
  );
}
