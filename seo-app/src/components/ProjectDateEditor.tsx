import React, { useState, useRef, useEffect } from 'react';
import { Calendar, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Project } from '../types';

interface ProjectDateEditorProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  viewMode: 'grid' | 'list';
}

export function ProjectDateEditor({ project, onUpdateProject, viewMode }: ProjectDateEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(project.startDate || '');
  const [endDate, setEndDate] = useState(project.endDate || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateProject({
      ...project,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });
    setIsOpen(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    } catch (e) {
      return dateStr;
    }
  };

  const renderDateDisplay = () => {
    if (!project.startDate && !project.endDate) {
      return (
        <span className="text-white/40 hover:text-white/60 transition-colors border-b border-dashed border-white/20 group-hover:border-white/40 pb-0.5">
          {project.date || 'Definir período'}
        </span>
      );
    }

    if (project.startDate && project.endDate) {
      return (
        <span className="text-white/50 hover:text-white/70 transition-colors">
          {formatDate(project.startDate)} → {formatDate(project.endDate)}
        </span>
      );
    }

    if (project.startDate) {
      return (
        <span className="text-white/50 hover:text-white/70 transition-colors">
          Início: {formatDate(project.startDate)}
        </span>
      );
    }

    if (project.endDate) {
      return (
        <span className="text-white/50 hover:text-white/70 transition-colors">
          Até: {formatDate(project.endDate)}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 -ml-3 rounded-lg border border-transparent hover:border-white/10 transition-all group bg-white/[0.02]"
      >
        <Calendar className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80" />
        <div className="flex flex-col items-start leading-none">
          {renderDateDisplay()}
        </div>
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute bottom-full mb-2 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl z-[60] p-4 w-64 animate-in fade-in zoom-in-95 duration-200",
            viewMode === 'list' ? "left-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white/90">Configurar Período</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Data de Início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Data de Conclusão</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4" />
              Salvar período
            </button>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 overflow-hidden -mt-2">
            <div className="w-2.5 h-2.5 bg-[#1a1b1e] border border-white/10 rotate-45 origin-center mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
