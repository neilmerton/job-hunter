import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const authService = {
  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },
  
  async getUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }
    return user;
  },

  async signInWithPassword(credentials: { email: string; password: string }) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    return { data, error };
  },

  async signUp(credentials: { email: string; password: string; fullName: string }) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: { full_name: credentials.fullName },
      },
    });
    return { data, error };
  },

  async updatePassword(password: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw error;
    }
  },
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }
};
