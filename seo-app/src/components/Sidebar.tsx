import { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  BarChart2,
  Settings,
  Database,
  Users,
  Pin,
  PinOff
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isPinned, setIsPinned] = useState(true);

  const navLinks = [
    { id: 'painel', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'projetos', label: 'Meus Projetos', icon: Database },
    { id: 'insights', label: 'Insights Capvi', icon: BarChart2 },
    { id: 'equipe', label: 'Minha Equipe', icon: Users },
    { id: 'config', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className={cn(
      "h-screen bg-white/5 backdrop-blur-[24px] border-r border-white/5 transition-all duration-500 flex flex-col items-center py-10 group relative z-50",
      isPinned ? "w-80" : "w-24"
    )}>
      {/* Pin Toggle Button */}
      <button
        onClick={() => setIsPinned(!isPinned)}
        className="absolute -right-3 top-32 bg-white text-black rounded-full p-1.5 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
      >
        {isPinned ? <Pin size={10} /> : <PinOff size={10} />}
      </button>

      <div className="w-full px-6 flex flex-col items-start h-full">
        {/* Logo Area */}
        <div className={cn(
          "mb-20 transition-all flex items-center justify-start w-full",
          isPinned ? "px-2" : "justify-center"
        )}>
          {isPinned ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Search className="w-5 h-5 text-black" />
              </div>
              <span className="font-display font-black text-2xl tracking-tighter text-white">Capvi OS</span>
            </div>
          ) : (
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-black" />
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 w-full space-y-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={cn(
                  "relative w-full flex items-center gap-5 px-5 py-4 rounded-full transition-all group overflow-hidden",
                  isActive
                    ? "bg-white/10 text-white shadow-2xl shadow-black/40 font-bold border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5 font-medium"
                )}
                title={!isPinned ? link.label : undefined}
              >
                <Icon className={cn("w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "text-white")} />

                <span className={cn(
                  "whitespace-nowrap transition-all duration-500 text-left text-xs uppercase tracking-widest font-black",
                  isPinned ? "opacity-100" : "w-0 opacity-0"
                )}>
                  {link.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
