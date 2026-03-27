import { useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  Database,
  Pin,
  PinOff,
  ChevronDown,
  Search,
  Globe,
  FileText,
  Link,
  ShoppingCart,
  Store,
  Box,
  Package
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPinned?: boolean;
  setIsPinned?: (pinned: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isPinned: externalIsPinned, setIsPinned: externalSetIsPinned }: SidebarProps) {
  const [localIsPinned, setLocalIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isSeoOpen, setIsSeoOpen] = useState(false);

  const isPinned = externalIsPinned !== undefined ? externalIsPinned : localIsPinned;
  const setIsPinned = externalSetIsPinned || setLocalIsPinned;

  const isExpanded = isPinned || isHovered;

  const navLinks = [
    { id: 'inicio', label: 'INÍCIO', icon: LayoutDashboard },
    { id: 'projetos', label: 'Meus Projetos', icon: Database },
    {
      id: 'seo-group',
      label: 'CAPVI SEO',
      icon: Box,
      subItems: [
        { id: 'seo-resultados', label: 'Resultado de Buscas', icon: Search },
        { id: 'seo-palavras', label: 'Busca por Palavra Chave', icon: Search },
        { id: 'seo-dominio', label: 'Análise Domínio', icon: Globe },
        { id: 'seo-conteudo', label: 'Análise de Conteúdo', icon: FileText },
        { id: 'seo-pagina', label: 'Análise de Página', icon: FileText },
        { id: 'seo-backlink', label: 'Backlink', icon: Link },
        { id: 'seo-produtos', label: 'Análise Produtos', icon: ShoppingCart },
        { id: 'seo-marketplace', label: 'Marketplace', icon: Store },
      ]
    },
    { id: 'drop', label: 'CAPVI DROP', icon: Package }
  ];

  const configLink = { id: 'config', label: 'Configurações', icon: Settings };

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "h-screen bg-white/5 backdrop-blur-[24px] border-r border-white/5 transition-all duration-700 ease-in-out flex flex-col items-center py-10 group relative z-50",
        isExpanded ? "w-80" : "w-24"
      )}
    >
      {/* Pin Toggle Button */}
      <button
        onClick={() => setIsPinned(!isPinned)}
        className="absolute -right-3 top-32 bg-white text-black rounded-full p-1.5 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
      >
        {isPinned ? <Pin size={10} /> : <PinOff size={10} />}
      </button>

      <div className={cn(
        "w-full flex flex-col items-start h-full transition-all duration-700",
        isExpanded ? "px-6" : "px-4"
      )}>
        {/* Logo Area */}
        <div className={cn(
          "mb-20 transition-all flex items-center justify-start w-full",
          isExpanded ? "px-2" : "justify-center"
        )}>
          {isExpanded ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/10 group-hover:scale-105 transition-all duration-500 shrink-0">
                <img src="/logo-capvi.png" alt="Capvi Mascot" className="w-14 h-14 object-contain p-1 brightness-0" />
              </div>
              <span className="font-display font-black text-2xl tracking-tighter text-white">Capvi OS</span>
            </div>
          ) : (
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white/10 hover:scale-110 transition-all duration-500 shrink-0">
              <img src="/logo-capvi.png" alt="Capvi Mascot" className="w-14 h-14 object-contain p-1 brightness-0" />
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 w-full space-y-4 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {navLinks.map((link) => {
            const Icon = link.icon;

            if (link.subItems) {
              const isGroupActive = link.subItems.some(sub => sub.id === activeTab);
              return (
                <div key={link.id} className="w-full flex flex-col items-center">
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setIsSeoOpen(!isSeoOpen);
                      } else {
                        setActiveTab(link.subItems![0].id);
                      }
                    }}
                    className={cn(
                      "relative w-full flex items-center justify-between rounded-full transition-all group overflow-hidden transition-all duration-500",
                      isExpanded ? "gap-5 px-5 py-4" : "justify-center py-4 px-0",
                      isGroupActive || isSeoOpen
                        ? "bg-white/10 text-white shadow-2xl shadow-black/40 font-bold border border-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/5 font-medium"
                    )}
                    title={!isExpanded ? link.label : undefined}
                  >
                    <div className={cn("flex items-center", isExpanded ? "gap-5" : "justify-center w-full")}>
                      <Icon className={cn("w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110", (isGroupActive || isSeoOpen) && "text-white")} />
                      <span className={cn(
                        "whitespace-nowrap transition-all duration-500 text-left text-xs uppercase tracking-widest font-black leading-none",
                        isExpanded ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 w-0 hidden"
                      )}>
                        {link.label}
                      </span>
                    </div>
                    {isExpanded && (
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-300",
                          isSeoOpen ? "rotate-180" : ""
                        )}
                      />
                    )}
                  </button>
                  
                  <div className={cn(
                    "w-full overflow-hidden transition-all duration-500 flex flex-col space-y-1",
                    isSeoOpen && isExpanded ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0 hidden"
                  )}>
                    {link.subItems!.map(subItem => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => setActiveTab(subItem.id)}
                          className={cn(
                            "w-full flex items-center gap-4 py-3 pl-14 pr-5 rounded-full transition-all group",
                            isSubActive
                              ? "bg-white/10 text-white font-bold"
                              : "text-white/50 hover:text-white hover:bg-white/5 font-medium"
                          )}
                          title={!isExpanded ? subItem.label : undefined}
                        >
                          <SubIcon className={cn("w-4 h-4 flex-shrink-0", isSubActive && "text-white")} />
                          <span className="text-[10px] uppercase tracking-wider font-bold whitespace-nowrap">
                            {subItem.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={cn(
                  "relative w-full flex items-center rounded-full transition-all group overflow-hidden transition-all duration-500",
                  isExpanded ? "gap-5 px-5 py-4" : "justify-center py-4 px-0",
                  isActive
                    ? "bg-white/10 text-white shadow-2xl shadow-black/40 font-bold border border-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/5 font-medium"
                )}
                title={!isExpanded ? link.label : undefined}
              >
                <Icon className={cn("w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "text-white")} />

                <span className={cn(
                  "whitespace-nowrap transition-all duration-500 text-left text-xs uppercase tracking-widest font-black leading-none",
                  isExpanded ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 w-0 hidden"
                )}>
                  {link.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer Configuration */}
        <div className="w-full pt-10 border-t border-white/5 mt-auto">
          <button
            onClick={() => setActiveTab(configLink.id)}
            className={cn(
              "relative w-full flex items-center rounded-full transition-all group overflow-hidden transition-all duration-500",
              isExpanded ? "gap-5 px-5 py-4" : "justify-center py-4 px-0",
              activeTab === configLink.id
                ? "bg-white/10 text-white shadow-2xl shadow-black/40 font-bold border border-white/10"
                : "text-white/60 hover:text-white hover:bg-white/5 font-medium"
            )}
            title={!isExpanded ? configLink.label : undefined}
          >
            <configLink.icon className={cn("w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110", activeTab === configLink.id && "text-white")} />

            <span className={cn(
              "whitespace-nowrap transition-all duration-500 text-left text-xs uppercase tracking-widest font-black leading-none",
              isExpanded ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 w-0"
            )}>
              {configLink.label}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
