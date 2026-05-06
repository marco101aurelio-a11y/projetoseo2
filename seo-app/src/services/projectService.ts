import type { Project } from '../types';

const STORAGE_KEY = 'capvi_seo_projects';

export const projectService = {
  // Returns only NON-archived projects
  getProjects: (): Project[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    const all: Project[] = data ? JSON.parse(data) : [];
    return all.filter(p => !p.archived);
  },

  // Returns only archived projects
  getArchivedProjects: (): Project[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    const all: Project[] = data ? JSON.parse(data) : [];
    return all.filter(p => p.archived === true);
  },

  saveProject: (project: Omit<Project, 'id' | 'createdAt'> & { id?: string }): Project => {
    const data = localStorage.getItem(STORAGE_KEY);
    const projects: Project[] = data ? JSON.parse(data) : [];

    const newProject: Project = {
      ...project,
      id: project.id || crypto.randomUUID(),
      createdAt: (project as any).createdAt || new Date().toISOString(),
      keywords: project.keywords || [],
      labelIds: project.labelIds || []
    } as Project;

    const index = projects.findIndex(p => String(p.id) === String(newProject.id));

    if (index !== -1) {
      projects[index] = newProject;
    } else {
      projects.unshift(newProject);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return newProject;
  },

  archiveProject: (id: string): void => {
    const data = localStorage.getItem(STORAGE_KEY);
    const projects: Project[] = data ? JSON.parse(data) : [];
    const index = projects.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
      projects[index] = { ...projects[index], archived: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  },

  unarchiveProject: (id: string): void => {
    const data = localStorage.getItem(STORAGE_KEY);
    const projects: Project[] = data ? JSON.parse(data) : [];
    const index = projects.findIndex(p => String(p.id) === String(id));
    if (index !== -1) {
      projects[index] = { ...projects[index], archived: false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  },

  deleteProject: (id: string): void => {
    const data = localStorage.getItem(STORAGE_KEY);
    const projects: Project[] = data ? JSON.parse(data) : [];
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
