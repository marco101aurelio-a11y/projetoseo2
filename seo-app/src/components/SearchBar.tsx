import { useState } from 'react';
import type { FormEvent } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-3xl mx-auto relative group"
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-slate-300 to-slate-400 rounded-2xl blur opacity-20 transition-opacity duration-500",
        isFocused ? "opacity-40" : "group-hover:opacity-30"
      )} />
      
      <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-500/20">
        <div className="pl-5 pr-3 text-slate-400">
          <Search className="w-6 h-6" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Digite a palavra-chave, domínio ou URL..."
          className="flex-1 py-4 px-2 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none text-lg"
          disabled={isLoading}
        />
        
        <div className="pr-3 pl-2">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="premium-button py-2 px-4 rounded-xl flex items-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Buscar</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </form>
  );
}
