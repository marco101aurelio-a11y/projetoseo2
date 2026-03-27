import { useState } from 'react';
import { Search, Check, LayoutGrid, List, ChevronDown, Plus, MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProjectView } from './ProjectView';

export interface ProjectData {
  id: number;
  title: string;
  date: string;
  sources: number;
}

export function Projects({ 
  onSidebarClose, 
  projects, 
  setProjects 
}: { 
  onSidebarClose?: () => void;
  projects: ProjectData[];
  setProjects: (projects: ProjectData[]) => void;
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  if (selectedProject) {
    return <ProjectView project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  const handleCreateNewProject = () => {
    const newProject = {
      id: Date.now(),
      title: 'Untitled notebook',
      date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
      sources: 0
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    if (onSidebarClose) onSidebarClose();
  };

  return (
    <div className="w-full text-white animate-in fade-in slide-in-from-bottom-12 duration-1000">
      
      {/* Header da Aba */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h2 className="text-3xl font-display font-black text-white px-2">Projetos Recentes</h2>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Lupa */}
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Search className="w-4 h-4 text-white/70" />
          </button>

          {/* Toggle View */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 h-10">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("flex items-center justify-center w-auto px-3 h-full rounded-full transition-colors", viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}
            >
              <Check className={cn("w-3 h-3 mr-1.5", viewMode === 'list' && "hidden")} />
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("flex items-center justify-center w-auto px-3 h-full rounded-full transition-colors", viewMode === 'list' ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70")}
            >
              <Check className={cn("w-3 h-3 mr-1.5", viewMode === 'grid' && "hidden")} />
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <button className="h-10 px-5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm font-bold text-white/80">
            Mais recentes <ChevronDown className="w-4 h-4" />
          </button>

          {/* Criar Novo */}
          <button 
            onClick={handleCreateNewProject}
            className="h-10 px-6 rounded-full bg-white text-black flex items-center gap-2 hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 font-black text-sm"
          >
            <Plus className="w-4 h-4" /> Criar novo
          </button>
        </div>
      </div>

      {/* Grid de Projetos */}
      <div className={cn(
        "grid gap-6",
        viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
      )}>
        
        {/* Card Criar Novo Projeto (Mesmo tamanho dos outros) */}
        <button 
          onClick={handleCreateNewProject}
          className={cn(
          "bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1 group min-h-[240px]",
          viewMode === 'list' && "min-h-[100px] flex-row justify-start px-8"
        )}>
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors text-white">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg text-white/80 group-hover:text-white transition-colors">
            Criar novo projeto
          </span>
        </button>

        {/* Lista Projetos */}
        {projects.map((project) => (
          <div 
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className={cn(
              "bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1 relative group cursor-pointer flex flex-col justify-between min-h-[240px]",
              viewMode === 'list' && "min-h-[100px] flex-row items-center space-x-6 gap-6"
            )}
          >
            {viewMode === 'grid' && (
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white/60 hover:text-white hover:bg-white/20">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className={cn("flex flex-col gap-4 w-full flex-1", viewMode === 'list' && "flex-row items-center")}>
              {/* Onde iria a capa customizada ou cor */}
              <div className={cn("w-full h-24 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center relative overflow-hidden", viewMode === 'list' && "w-16 h-16 rounded-xl shrink-0")}>
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">🏢</div>
                </div>
                <span className="text-3xl drop-shadow-lg">✨</span>
              </div>
              <h3 className={cn("font-bold text-base text-white leading-tight line-clamp-2", viewMode === 'list' && "mb-0")}>{project.title}</h3>
            </div>

            <div className={cn("flex items-center justify-between text-xs font-medium text-white/40 mt-4", viewMode === 'list' && "mt-0 w-[200px] justify-end")}>
              <span>{project.date} · {project.sources} fontes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
