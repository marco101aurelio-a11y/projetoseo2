import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Globe, Calendar, Tag, Book, ArrowLeft } from 'lucide-react';
import { projectService } from '../services/projectService';
import type { Project } from '../types';
import { AIGuideNotebook } from './AIGuideNotebook';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '', description: '' });

  const loadProjects = () => {
    setProjects(projectService.getProjects());
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    projectService.saveProject({
      ...formData,
      id: editingProject?.id,
      keywords: editingProject?.keywords || []
    } as any);
    setFormData({ name: '', url: '', description: '' });
    setIsAdding(false);
    setEditingProject(null);
    loadProjects();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      projectService.deleteProject(id);
      loadProjects();
    }
  };

  const handleEdit = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setFormData({ name: project.name, url: project.url, description: project.description });
    setIsAdding(true);
  };

  if (selectedProject) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedProject(null)}
              className="p-3 glass-panel hover:bg-orange-500/10 dark:hover:bg-white/10 transition-all rounded-2xl group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase">{selectedProject.name}</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Notebook de Inteligência Transversal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="px-5 py-2 glass-panel bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-orange-900/10 ring-1 ring-orange-500/20">
                IA DEDICADA: ATIVA
             </span>
          </div>
        </div>
        <AIGuideNotebook />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase">Meus Projetos</h2>
          <p className="text-white/40 font-black mt-2 uppercase tracking-[0.2em] text-[10px]">Arquitetura de Ativos de Alto Desempenho.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="premium-button shadow-xl shadow-orange-900/20"
        >
          <Plus className="w-5 h-5" /> Inicializar Ativo
        </button>
      </div>

      {isAdding && (
        <div className="glass-card p-12 animate-in zoom-in-95 duration-500 mb-12 border-none ring-1 ring-white/10 shadow-orange-900/10">
          <h3 className="text-3xl font-black tracking-tighter mb-10 uppercase">{editingProject ? 'Configurar Camada' : 'Arquitetar Novo Projeto'}</h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#95a5a6] uppercase tracking-[0.2em] px-2">Identidade do Projeto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Capvi Store"
                  className="premium-input"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#95a5a6] uppercase tracking-[0.2em] px-2">Domínio Operacional</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://capvi.ai"
                  className="premium-input"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#95a5a6] uppercase tracking-[0.2em] px-2">Diretrizes & Contexto Estratégico</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Defina o nicho, público e objetivos transversais..."
                className="premium-input h-40 resize-none pt-5"
              />
            </div>
            <div className="flex justify-end gap-6 mt-10 pt-8 border-t border-white/5">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setEditingProject(null); }}
                className="px-8 py-4 rounded-2xl font-black text-[#95a5a6] hover:text-white transition-all uppercase tracking-widest text-[10px]"
              >
                Abortar
              </button>
              <button
                type="submit"
                className="premium-button px-12"
              >
                {editingProject ? 'Atualizar Protocolo' : 'Confirmar Arquitetura'}
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="glass-card p-24 text-center border-none ring-1 ring-white/10">
          <div className="bg-orange-500/10 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-orange-950/20">
            <Globe className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-3xl font-black tracking-tighter text-white mb-4 uppercase">Nenhum Ativo Detectado</h3>
          <p className="text-white/40 font-bold max-w-sm mx-auto mb-12 uppercase tracking-[0.2em] text-[10px] leading-relaxed">
            Inicie a arquitetura do seu primeiro projeto para desbloquear a inteligência CAPVI OS.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="premium-button"
          >
            Adicionar Primeiro Ativo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map(project => (
            <div 
              key={project.id} 
              onClick={() => setSelectedProject(project)}
              className="glass-card p-10 hover:-translate-y-3 hover:shadow-orange-900/20 transition-all duration-700 group cursor-pointer relative overflow-hidden border-none ring-1 ring-white/5"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-full blur-[60px] -mr-20 -mt-20 group-hover:bg-orange-500/10 transition-colors duration-700"></div>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="bg-orange-600 p-4 rounded-2xl shadow-2xl shadow-orange-900/40 group-hover:scale-110 transition-transform duration-500">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <button onClick={(e) => handleEdit(project, e)} className="p-3 glass-panel hover:bg-white dark:hover:bg-white/10 transition-all rounded-xl border-none ring-1 ring-white/10">
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={(e) => handleDelete(project.id, e)} className="p-3 glass-panel hover:bg-red-500/20 hover:text-red-500 transition-all rounded-xl border-none ring-1 ring-white/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-black tracking-tighter text-white mb-4 leading-tight uppercase group-hover:text-orange-500 transition-colors">{project.name}</h3>
                <p className="text-white/40 font-bold text-sm mb-10 line-clamp-2 leading-relaxed uppercase tracking-wide opacity-80">{project.description || 'Protocólo sem diretrizes'}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                    <Tag className="w-3.5 h-3.5 text-orange-500" />
                    <span>{project.keywords.length} Termos</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <button className="w-full mt-10 py-5 glass-panel bg-orange-500/5 text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 rounded-2xl border-none ring-1 ring-orange-500/20 group-hover:ring-orange-600/50">
                  <Book className="w-4 h-4" />
                  Sincronizar Notebook
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
