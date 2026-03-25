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
        "flex items-center px-8 py-2 transition-all duration-500 rounded-full h-24",
        isFocused 
          ? "bg-surface-container-lowest outline outline-1 outline-on-surface/10 shadow-[0_40px_80px_rgba(25,28,29,0.08)]" 
          : "bg-surface-container-highest"
      )}>
        <Search className={cn(
          "w-6 h-6 transition-colors duration-500 mr-4",
          isFocused ? "text-black" : "text-on-surface-variant/40"
        )} />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Keyword, domain or strategy..."
          className="flex-1 py-4 px-2 bg-transparent text-black placeholder:text-on-surface-variant/30 focus:outline-none text-xl font-medium min-w-0"
          disabled={isLoading}
        />

        <div className="pl-4">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="premium-button h-14 px-10 gap-3 group/btn"
          >
            <span className="hidden sm:inline uppercase tracking-widest text-[10px] font-black">Analyze</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </form>
  );
}
