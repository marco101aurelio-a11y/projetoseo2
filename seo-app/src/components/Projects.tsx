import React, { useState, useEffect } from 'react';
import { Search, Check, LayoutGrid, List, ChevronDown, Plus, Settings, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProjectView } from './ProjectView';
import { projectService } from '../services/projectService';
import { ProjectLabels } from './ProjectLabels';
import { labelService } from '../services/labelService';
import { ProjectDateEditor } from './ProjectDateEditor';
import type { Label, Project } from '../types';


export function Projects({ 
  onSidebarClose 
}: { 
  onSidebarClose?: () => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [globalLabels, setGlobalLabels] = useState<Label[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  // labelId -> expanded (nome fixo visível)
  const [expandedLabels, setExpandedLabels] = useState<Set<string>>(new Set());

  const toggleLabelExpand = (e: React.MouseEvent, labelId: string) => {
    e.stopPropagation();
    setExpandedLabels(prev => {
      const next = new Set(prev);
      next.has(labelId) ? next.delete(labelId) : next.add(labelId);
      return next;
    });
  };

  useEffect(() => {
    setGlobalLabels(labelService.getLabels());
  }, []);

  const handleUpdateProject = (updatedProject: Project) => {
    projectService.saveProject(updatedProject);
    setProjects(projectService.getProjects() as any[]);
    setGlobalLabels(labelService.getLabels());
  };

  const handleArchiveProject = (id: string) => {
    projectService.archiveProject(id);
    setProjects(projectService.getProjects() as any[]);
    setArchivedProjects(projectService.getArchivedProjects());
  };

  const handleUnarchiveProject = (id: string) => {
    projectService.unarchiveProject(id);
    setProjects(projectService.getProjects() as any[]);
    setArchivedProjects(projectService.getArchivedProjects());
  };

  useEffect(() => {
    // Sync with localStorage on mount
    setProjects(projectService.getProjects() as any[]);
    setArchivedProjects(projectService.getArchivedProjects());
  }, [setProjects]);

  if (selectedProject) {
    return (
      <ProjectView 
        project={selectedProject} 
        onBack={() => {
          setSelectedProject(null);
          // Forçar recarregamento ao voltar
          setProjects(projectService.getProjects());
        }} 
      />
    );
  }

  const handleCreateNewProject = () => {
    const newProject = projectService.saveProject({
      title: 'Untitled notebook',
      sources: 0,
      date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    
    setProjects(projectService.getProjects());
    setSelectedProject(newProject);
    if (onSidebarClose) onSidebarClose();
  };

  return (
    <div className="w-full text-white animate-in fade-in slide-in-from-bottom-12 duration-1000">
      
      {/* Header da Aba */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h2 className="text-3xl font-display font-black text-white px-2">Projetos Recentes</h2>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Engrenagem — Gerenciar arquivados */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowArchived(prev => !prev); }}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Configurações"
            >
              <Settings className="w-4 h-4 text-white/70" />
            </button>

            {showArchived && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-12 w-80 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <p className="text-sm font-bold text-white/90">Projetos Arquivados</p>
                  <button onClick={() => setShowArchived(false)} className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10">
                    ✕
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {archivedProjects.length === 0 ? (
                    <p className="text-center text-white/30 text-sm py-8">Nenhum projeto arquivado</p>
                  ) : (
                    archivedProjects.map(p => (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 font-medium truncate">{p.title || p.name || 'Sem título'}</p>
                          <p className="text-xs text-white/30">{(p as any).date || 'Data desconhecida'}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleUnarchiveProject(String(p.id)); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-md text-xs font-medium transition-colors shrink-0"
                          title="Restaurar projeto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restaurar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Lupa */}
          <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Search className="w-4 h-4 text-white/70" />
          </button>

          {/* Seletor de visualização */}
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-full transition-all",
                viewMode === 'grid' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-full transition-all",
                viewMode === 'list' ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>


          {/* Botão Criar Novo (Desktop) */}
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
              <div className={cn("absolute right-4 top-4 transition-opacity z-10", openDropdownId === project.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                <ProjectLabels 
                  project={project} 
                  onUpdateProject={handleUpdateProject}
                  onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? String(project.id) : null)}
                  onArchive={() => handleArchiveProject(String(project.id))}
                />
              </div>
            )}
            
            <div className={cn("flex flex-col gap-4 w-full flex-1", viewMode === 'list' && "flex-row items-center")}>
              {/* Capa do Projeto */}
              {(() => {
                const cover = (project as any).cover as { type: 'color' | 'image'; value: string; size: 'half' | 'full' } | undefined;
                const isFullCover = cover?.size === 'full';
                const hasCover = !!cover;

                const baseClass = cn(
                  "w-full rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden transition-all",
                  viewMode === 'list' ? "w-16 h-16 rounded-xl shrink-0" : isFullCover ? "h-28" : "h-24"
                );

                const bgStyle = hasCover
                  ? cover.type === 'color'
                    ? { backgroundColor: cover.value }
                    : { backgroundImage: `url(${cover.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : {};

                return (
                  <div
                    className={hasCover ? baseClass : cn(baseClass, "bg-gradient-to-br from-indigo-500/20 to-purple-500/20")}
                    style={bgStyle}
                  >
                    {/* Overlay escuro para imagens (legibilidade) */}
                    {cover?.type === 'image' && <div className="absolute inset-0 bg-black/20" />}

                    {!hasCover && (
                      <>
                        <div className="absolute top-2 left-2 flex gap-1 z-0">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">🏢</div>
                        </div>
                        <span className="text-3xl drop-shadow-lg z-0">✨</span>
                      </>
                    )}
                  </div>
                );
              })()}

              <h3 className={cn("font-bold text-base text-white leading-tight line-clamp-2", viewMode === 'list' && "mb-0")}>{project.title}</h3>
            </div>

            {/* Etiquetas — acima da data */}
            {(project.labelIds || []).length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {(project.labelIds || []).map(labelId => {
                  const label = globalLabels.find(l => l.id === labelId);
                  if (!label) return null;
                  const isExpanded = expandedLabels.has(label.id);
                  return (
                    <div
                      key={label.id}
                      onClick={(e) => toggleLabelExpand(e, label.id)}
                      title={label.title}
                      className="flex items-center h-6 rounded-full overflow-hidden cursor-pointer select-none"
                      style={{
                        backgroundColor: label.color,
                        maxWidth: isExpanded ? '200px' : '44px',
                        transition: 'max-width 0.25s ease, padding 0.25s ease',
                        paddingLeft: isExpanded ? '12px' : '0',
                        paddingRight: isExpanded ? '12px' : '0',
                      }}
                    >
                      <span
                        className="text-xs font-semibold text-white whitespace-nowrap"
                        style={{
                          opacity: isExpanded ? 1 : 0,
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        {label.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={cn("flex items-center justify-between text-xs font-medium text-white/40 mt-2", viewMode === 'list' && "mt-0 w-[200px] justify-end")}>
              <div className="flex items-center gap-2">
                <ProjectDateEditor 
                  project={project} 
                  onUpdateProject={handleUpdateProject} 
                  viewMode={viewMode}
                />
                <span>· {project.sources} fontes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
