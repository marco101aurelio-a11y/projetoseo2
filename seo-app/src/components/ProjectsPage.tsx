import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Globe, Calendar, Tag } from 'lucide-react';
import { projectService } from '../services/projectService';
import type { Project } from '../types';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({ name: '', url: '', description: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    setProjects(projectService.getProjects());
  };

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

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      projectService.deleteProject(id);
      loadProjects();
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, url: project.url, description: project.description });
    setIsAdding(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Meus Projetos</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Gerencie seus sites e campanhas de SEO.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" /> Novo Projeto
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm animate-in zoom-in-95 duration-200">
          <h3 className="text-xl font-bold mb-6">{editingProject ? 'Editar Projeto' : 'Criar Novo Projeto'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Nome do Projeto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Minha Loja Virtual"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all outline-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">URL do Site</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://exemplo.com"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all outline-none font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Descrição / Notas</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição do projeto ou objetivos de SEO..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all outline-none font-medium h-32 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setEditingProject(null); }}
                className="px-6 py-3 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-sans"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg transition-all font-sans"
              >
                {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-slate-100/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-16 text-center">
          <div className="bg-white dark:bg-slate-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Globe className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nenhum projeto encontrado</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
            Comece criando seu primeiro projeto para gerenciar suas palavras-chave e insights.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-slate-900 dark:text-white font-bold underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Adicionar meu primeiro projeto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-slate-900 dark:text-white" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(project)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">{project.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-6 line-clamp-2">{project.description || 'Sem descrição'}</p>
              
              <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-bold">
                  <Globe className="w-4 h-4" />
                  <span className="truncate">{project.url.replace('https://', '').replace('http://', '')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-bold font-sans">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 font-bold font-sans">
                  <Tag className="w-4 h-4" />
                  <span>{project.keywords.length} palavras-chave</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
