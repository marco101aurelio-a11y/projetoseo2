
import { Activity } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b-0 rounded-none dark:border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-slate-800 dark:bg-slate-700 text-white p-2 rounded-xl shadow-slate-500/30 shadow-lg">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            SEO Logic
          </span>
        </div>
      </div>
    </header>
  );
}
