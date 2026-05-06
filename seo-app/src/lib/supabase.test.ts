import { describe, it, expect, vi } from 'vitest';
import { supabase } from './supabase';

describe('Supabase Client Configuration', () => {
  it('should initialize the supabase client successfully', () => {
    expect(supabase).toBeDefined();
    // In a real environment with credentials, auth URL should be configured
    expect(typeof supabase.auth).toBe('object');
  });

  it('should have the correct base url from environment', () => {
    // Import meta env injected by vite/vitest
    const expectedUrl = import.meta.env.VITE_SUPABASE_URL || '';
    expect(supabase.supabaseUrl).toBe(expectedUrl);
  });
});
