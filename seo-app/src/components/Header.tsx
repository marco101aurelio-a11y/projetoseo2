export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-transparent backdrop-blur-xl">
      <div className="px-12 sm:px-20 h-24 flex items-center justify-end">
        <div className="flex items-center gap-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 hidden md:block">System Status: Optimal</span>
          
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="text-right hidden sm:block">
               <p className="text-sm font-black text-white leading-none mb-1">Lucas Moraes</p>
               <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Admin Plan</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black font-black text-sm group-hover:scale-110 transition-transform">
              LM
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
