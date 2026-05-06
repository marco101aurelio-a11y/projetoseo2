import type { Label } from '../types';

const STORAGE_KEY = 'capvi_seo_labels';

export const labelService = {
  getLabels: (): Label[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveLabel: (label: Omit<Label, 'id'> & { id?: string }): Label => {
    const labels = labelService.getLabels();
    
    const newLabel: Label = {
      ...label,
      id: label.id || crypto.randomUUID()
    };

    const index = labels.findIndex(l => String(l.id) === String(newLabel.id));
    
    if (index !== -1) {
      labels[index] = newLabel;
    } else {
      labels.unshift(newLabel);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
    return newLabel;
  },

  deleteLabel: (id: string): void => {
    const labels = labelService.getLabels();
    const filtered = labels.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};
