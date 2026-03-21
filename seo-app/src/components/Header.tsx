import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-transparent dark:border-transparent">
      <div className="px-6 sm:px-10 h-20 flex items-center justify-end">
        <div className="flex items-center gap-6">
          <ThemeToggle />
          
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
