import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Search, Edit2, Check, X, ChevronLeft, Tag, Image as ImageIcon, Archive, Upload, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { labelService } from '../services/labelService';
import type { Label, Project } from '../types';

interface ProjectLabelsProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onOpenChange?: (isOpen: boolean) => void;
  onArchive?: () => void;
}

const PALETTE = [
  '#065F46', '#166534', '#92400E', '#B45309', '#B91C1C', '#7E22CE',
  '#10B981', '#EAB308', '#F59E0B', '#F97316', '#EF4444', '#A855F7',
  '#1E3A8A', '#1D4ED8', '#0F766E', '#115E59', '#701A75', '#374151',
  '#2563EB', '#0EA5E9', '#84CC16', '#EC4899', '#9CA3AF'
];

const COVER_COLORS = [
  '#1E7E34', '#856404', '#A04000', '#922B21', '#6C1A75',
  '#1565C0', '#0E6655', '#4A235A', '#1B2631', '#515A5A',
];

const UNSPLASH_PHOTOS: string[] = [];

export function ProjectLabels({ project, onUpdateProject, onOpenChange, onArchive }: ProjectLabelsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'actions' | 'list' | 'editor' | 'cover' | 'confirm_archive' | 'date'>('actions');
  const [labels, setLabels] = useState<Label[]>([]);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editColor, setEditColor] = useState(PALETTE[0]);

  // Cover State
  const [coverSize, setCoverSize] = useState<'half' | 'full'>(project.cover?.size || 'half');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) handleSelectCover('image', dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleSelectCover = (type: 'color' | 'image', value: string) => {
    const updatedProject = { ...project, cover: { type, value, size: coverSize } };
    onUpdateProject(updatedProject);
  };

  const handleCoverSize = (size: 'half' | 'full') => {
    setCoverSize(size);
    if (project.cover) {
      onUpdateProject({ ...project, cover: { ...project.cover, size } });
    }
  };

  const handleRemoveCover = () => {
    const { cover, ...rest } = project as any;
    onUpdateProject(rest as Project);
  };

  useEffect(() => {
    setLabels(labelService.getLabels());
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onOpenChange?.(newIsOpen);
    setMode('actions');
    setSearch('');
  };

  const handleToggleLabel = (e: React.MouseEvent, labelId: string) => {
    e.stopPropagation();
    const currentLabelIds = project.labelIds || [];
    const newLabelIds = currentLabelIds.includes(labelId)
      ? currentLabelIds.filter(id => id !== labelId)
      : [...currentLabelIds, labelId];

    const updatedProject = { ...project, labelIds: newLabelIds };
    onUpdateProject(updatedProject);
  };

  const openEditor = (e: React.MouseEvent, label?: Label) => {
    e.stopPropagation();
    if (label) {
      setEditingId(label.id);
      setEditTitle(label.title);
      setEditColor(label.color);
    } else {
      setEditingId(null);
      setEditTitle('');
      setEditColor(PALETTE[0]);
    }
    setMode('editor');
  };

  const handleSaveLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;

    const newLabel = labelService.saveLabel({
      id: editingId || undefined,
      title: editTitle.trim(),
      color: editColor
    });

    setLabels(labelService.getLabels());
    setMode('list');

    // Se acabou de criar uma etiqueta nova, já adiciona no projeto atual
    if (!editingId) {
      const currentLabelIds = project.labelIds || [];
      if (!currentLabelIds.includes(newLabel.id)) {
        onUpdateProject({ ...project, labelIds: [...currentLabelIds, newLabel.id] });
      }
    }
  };

  const handleDeleteLabel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingId) return;
    labelService.deleteLabel(editingId);
    setLabels(labelService.getLabels());
    
    // Remove do projeto se estivesse aplicada
    const currentLabelIds = project.labelIds || [];
    if (currentLabelIds.includes(editingId)) {
      onUpdateProject({ 
        ...project, 
        labelIds: currentLabelIds.filter(id => id !== editingId) 
      });
    }
    setMode('list');
  };

  const filteredLabels = labels.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
  const activeLabelIds = project.labelIds || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="p-2.5 bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-white/20 border border-white/5 hover:border-white/20 transition-all z-10 relative shadow-lg active:scale-95"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-10 w-72 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
        >
          {mode === 'actions' && (
            <div className="flex flex-col py-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setMode('list'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Tag className="w-4 h-4" />
                Editar Etiquetas
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setMode('date'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Calendar className="w-4 h-4" />
                Configurar Período
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCoverSize(project.cover?.size || 'half'); setMode('cover'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <ImageIcon className="w-4 h-4" />
                Alterar capa
              </button>
              <div className="h-px bg-white/5 my-1" />
              <button 
                onClick={(e) => { e.stopPropagation(); setMode('confirm_archive'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
              >
                <Archive className="w-4 h-4" />
                Arquivar
              </button>
            </div>
          )}

          {mode === 'confirm_archive' && (
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-amber-400">
                <Archive className="w-5 h-5 shrink-0" />
                <p className="text-sm font-bold">Arquivar projeto?</p>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                O projeto <span className="text-white/80 font-semibold">"{project.title || project.name}"</span> será removido da sua tela inicial. Você pode restaurá-lo a qualquer momento em Configurações.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setMode('actions'); }}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-md text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpenChange?.(false); onArchive?.(); }}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md text-sm font-bold transition-colors"
                >
                  Arquivar
                </button>
              </div>
            </div>
          )}

          {mode === 'date' && (
            <>
              <div className="p-3 border-b border-white/5 flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setMode('actions'); }} className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-white/90 flex-1">Configurar Período</span>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpenChange?.(false); }} className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Data de Início</label>
                  <input
                    type="date"
                    value={project.startDate || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateProject({ ...project, startDate: e.target.value || undefined });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Data de Conclusão</label>
                  <input
                    type="date"
                    value={project.endDate || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateProject({ ...project, endDate: e.target.value || undefined });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
                  />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpenChange?.(false); }}
                  className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Check className="w-4 h-4" />
                  Concluir
                </button>
              </div>
            </>
          )}

          {mode === 'list' && (
            <>
              <div className="p-3 border-b border-white/5 flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setMode('actions'); }} className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-white/90 flex-1">Etiquetas</span>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpenChange?.(false); }} className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3">
                <div className="relative flex items-center mb-4">
                  <Search className="w-4 h-4 absolute left-3 text-white/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar etiquetas..."
                    className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="text-xs font-bold text-white/40 uppercase mb-2">Etiquetas</div>
                
                <div className="max-h-[200px] overflow-y-auto space-y-1 custom-scrollbar pr-1">
                  {filteredLabels.map(label => (
                    <div key={label.id} className="flex items-center gap-2 group cursor-pointer" onClick={(e) => handleToggleLabel(e, label.id)}>
                      <div className="w-4 h-4 border border-white/20 rounded-sm flex items-center justify-center bg-black/20 shrink-0">
                        {activeLabelIds.includes(label.id) && <Check className="w-3 h-3 text-blue-400" />}
                      </div>
                      <div 
                        className="flex-1 h-8 rounded-md flex items-center px-3 text-sm font-medium text-white/90 truncate transition-transform hover:scale-[1.02]"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.title}
                      </div>
                      <button 
                        onClick={(e) => openEditor(e, label)}
                        className="p-1.5 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-white/10 shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {filteredLabels.length === 0 && (
                    <div className="text-center text-white/40 text-sm py-4">Nenhuma etiqueta encontrada</div>
                  )}
                </div>
              </div>

              <div className="p-3 border-t border-white/5">
                <button 
                  onClick={(e) => openEditor(e)}
                  className="w-full bg-white/5 hover:bg-white/10 text-white/90 font-medium py-2 rounded-md transition-colors text-sm"
                >
                  Criar uma nova etiqueta
                </button>
              </div>
            </>
          )}

          {mode === 'editor' && (
            <>
              <div className="p-3 border-b border-white/5 flex items-center gap-2">
                <button onClick={() => setMode('list')} className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-white/90 flex-1 text-center pr-6">
                  {editingId ? 'Editar Etiqueta' : 'Criar Etiqueta'}
                </span>
              </div>

              <div className="p-4 flex flex-col gap-4">
                {/* Preview block */}
                <div 
                  className="w-full h-10 rounded-md flex items-center justify-center text-sm font-bold text-white shadow-inner"
                  style={{ backgroundColor: editColor }}
                >
                  {editTitle || 'Nova Etiqueta'}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/60">Título</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/60">Selecionar uma cor</label>
                  <div className="grid grid-cols-6 gap-2">
                    {PALETTE.map(color => (
                      <button
                        key={color}
                        onClick={() => setEditColor(color)}
                        className="w-full aspect-square rounded-md flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {editColor === color && <Check className="w-4 h-4 text-white/90 drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>

                {editingId && (
                  <button 
                    onClick={handleDeleteLabel}
                    className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md text-sm font-medium transition-colors"
                  >
                    <X className="w-4 h-4" /> Remover etiqueta
                  </button>
                )}

                <button 
                  onClick={handleSaveLabel}
                  disabled={!editTitle.trim()}
                  className="w-max px-6 py-2 mt-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm font-bold transition-colors"
                >
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </>
          )}
          {mode === 'cover' && (
            <>
              <div className="p-3 border-b border-white/5 flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); setMode('actions'); }} className="text-white/60 hover:text-white p-1 rounded hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-white/90 flex-1">Capa</span>
                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpenChange?.(false); }} className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-4 max-h-[480px] overflow-y-auto">

                {/* Tamanho */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white/50 uppercase">Tamanho</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleCoverSize('half')}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        coverSize === 'half' ? 'border-blue-500' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full h-14 bg-white/5 flex flex-col justify-start p-1.5 gap-1">
                        <div className="w-full h-4 rounded bg-indigo-500/40" />
                        <div className="w-full h-2 rounded bg-white/10" />
                        <div className="w-3/4 h-2 rounded bg-white/10" />
                      </div>
                      <span className="text-[10px] text-white/60 block text-center py-1">Meia capa</span>
                    </button>
                    <button
                      onClick={() => handleCoverSize('full')}
                      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                        coverSize === 'full' ? 'border-blue-500' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full h-14 bg-indigo-500/40 flex flex-col justify-end p-1.5 gap-1">
                        <div className="w-full h-2 rounded bg-white/20" />
                        <div className="w-3/4 h-2 rounded bg-white/20" />
                      </div>
                      <span className="text-[10px] text-white/60 block text-center py-1">Capa inteira</span>
                    </button>
                  </div>
                </div>

                {/* Cores */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white/50 uppercase">Cores</p>
                  <div className="grid grid-cols-5 gap-2">
                    {COVER_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => handleSelectCover('color', color)}
                        className="w-full aspect-video rounded-md transition-all hover:scale-105 hover:ring-2 hover:ring-white/40 shadow-sm relative"
                        style={{ backgroundColor: color }}
                      >
                        {project.cover?.type === 'color' && project.cover.value === color && (
                          <Check className="w-4 h-4 text-white drop-shadow-md absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Anexos */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white/50 uppercase">Anexos</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white/5 hover:bg-white/10 text-white/80 font-medium py-2.5 rounded-md transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Carregar uma imagem de capa
                  </button>
                  {project.cover?.type === 'image' && (
                    <div className="w-full h-16 rounded-md overflow-hidden border border-white/10 relative">
                      <img src={project.cover.value} alt="Capa atual" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <span className="text-[11px] text-white/80 font-medium">Imagem atual</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remover capa */}
                {project.cover && (
                  <button
                    onClick={handleRemoveCover}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-md text-sm font-medium transition-colors"
                  >
                    <X className="w-4 h-4" /> Remover capa
                  </button>
                )}

              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
