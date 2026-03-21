import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Link as LinkIcon, 
  Share2,
  TrendingUp, 
  Settings, 
  HelpCircle,
  Bot,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isPinned, setIsPinned] = useState(true);

  const mainLinks = [
    { id: 'painel', label: 'Análise Palavras-Chave', icon: LayoutDashboard },
    { id: 'conteudo', label: 'Análise de Conteúdo', icon: FileText },
    { id: 'amazon', label: 'Análise Amazon', icon: ShoppingCart },
    { id: 'backlinks', label: 'Análise Backlinks', icon: LinkIcon },
    { id: 'social', label: 'Mídias Sociais', icon: Share2 },
    { id: 'tendencias', label: 'Tendências SEO', icon: TrendingUp },
    { id: 'capvi-ia', label: 'Capvi IA', icon: Bot },
  ];

  const bottomLinks = [
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
  ];

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 hidden lg:flex flex-col h-screen transition-all duration-300 z-50 flex-shrink-0 relative group",
        isPinned ? "w-72" : "w-[5.5rem] hover:w-72" // 5.5rem = 88px, enough to clip text but show icon centered
      )}
    >
      {/* Toggle Pinned Button */}
      <button 
        onClick={() => setIsPinned(!isPinned)}
        className="absolute -right-3 top-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-full p-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 z-50 transition-colors shadow-sm"
        title={isPinned ? "Recolher Menu" : "Fixar Menu"}
      >
        {isPinned ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
      </button>

      {/* Logo Area */}
      <div className="h-24 flex items-center px-6 overflow-hidden flex-shrink-0">
        <div className="flex items-center gap-4 w-60">
          <img 
            src="/capivara.png" 
            alt="Capvi Logo" 
            className="h-10 min-w-10 w-10 object-contain mix-blend-multiply filter transition-all grayscale contrast-200 dark:mix-blend-screen dark:invert dark:brightness-[300%] dark:contrast-[200%] flex-shrink-0" 
          />
          <span className={cn(
            "text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white pb-1 whitespace-nowrap transition-all duration-300",
            isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            Capvi SEO
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide overflow-x-hidden">
        <nav className="space-y-1.5 w-[16rem]">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={cn(
                  "w-[14.5rem] flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 relative group",
                  isActive 
                    ? "text-slate-900 dark:text-white font-bold" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800/20"
                )}
                title={!isPinned ? link.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-900 dark:bg-white rounded-r-full" />
                )}
                <Icon className={cn("w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "text-slate-900 dark:text-white")} />
                
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 text-left",
                  isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  {link.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Links */}
      <div className="p-4 mb-4 overflow-x-hidden flex-shrink-0">
        <nav className="space-y-1.5 w-[16rem]">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={cn(
                  "w-[14.5rem] flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 relative group",
                  isActive 
                    ? "text-slate-900 dark:text-white font-bold" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800/20"
                )}
                title={!isPinned ? link.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-slate-900 dark:bg-white rounded-r-full" />
                )}
                <Icon className={cn("w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "text-slate-900 dark:text-white")} />
                
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 text-left",
                  isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
