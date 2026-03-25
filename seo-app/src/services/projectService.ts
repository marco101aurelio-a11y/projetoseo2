import type { Project } from '../types';

const STORAGE_KEY = 'capvi_seo_projects';

export const projectService = {
  getProjects: (): Project[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveProject: (project: Omit<Project, 'id' | 'createdAt'> & { id?: string }): Project => {
    const projects = projectService.getProjects();
    const isNew = !project.id;
    
    const newProject: Project = {
      ...project,
      id: project.id || crypto.randomUUID(),
      createdAt: isNew ? new Date().toISOString() : (projects.find(p => p.id === project.id)?.createdAt || new Date().toISOString()),
      keywords: project.keywords || []
    } as Project;

    if (isNew) {
      projects.push(newProject);
    } else {
      const index = projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        projects[index] = newProject;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return newProject;
  },

  deleteProject: (id: string): void => {
    const projects = projectService.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
