import { createClient } from '@/lib/supabase/client';

export const profileService = {
  async getProfile(userId: string) {
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found', which is fine for new users
      console.error('Error fetching profile:', error);
    }
    
    return profile;
  },

  async updateProfile(userId: string, displayName: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        { id: userId, display_name: displayName, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );
    
    if (error) {
      throw error;
    }
  }
};
