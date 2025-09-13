// Profile utilities for handling the updated profile structure
import { supabase } from '@/lib/customSupabaseClient';
import type { Profile } from '@/types/database';

// Helper function to get full name from profile
export const getFullName = (profile: Profile | null): string => {
  if (!profile) return '';
  
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  
  return profile.first_name || profile.last_name || profile.email || 'Anonymous';
};

// Helper function to get profile initials
export const getInitials = (profile: Profile | null): string => {
  if (!profile) return '?';
  
  const firstName = profile.first_name?.charAt(0) || '';
  const lastName = profile.last_name?.charAt(0) || '';
  
  if (firstName && lastName) {
    return `${firstName}${lastName}`.toUpperCase();
  }
  
  if (firstName) return firstName.toUpperCase();
  if (lastName) return lastName.toUpperCase();
  if (profile.email) return profile.email.charAt(0).toUpperCase();
  
  return '?';
};

// Create or update profile after user registration/login
export const ensureProfile = async (user: any): Promise<Profile | null> => {
  if (!user) return null;
  
  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingProfile) {
      // Update last login
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return updatedProfile;
    }
    
    // Create new profile
    const [firstName, ...lastNameParts] = (user.user_metadata?.full_name || user.email?.split('@')[0] || '').split(' ');
    const lastName = lastNameParts.join(' ') || null;
    
    const newProfile = {
      user_id: user.id,
      first_name: firstName || null,
      last_name: lastName,
      email: user.email,
      is_writer: false,
      is_active: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      last_login_at: new Date().toISOString(),
    };
    
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();
    
    if (createError) throw createError;
    return createdProfile;
    
  } catch (error) {
    console.error('Error ensuring profile:', error);
    return null;
  }
};

// Update profile information
export const updateProfile = async (
  userId: string, 
  updates: Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Profile | null> => {
  try {
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ 
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return updatedProfile;
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

// Get profile by user ID
export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return profile;
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Get profile by profile ID
export const getProfileById = async (profileId: string): Promise<Profile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();
    
    if (error) throw error;
    return profile;
    
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Get all writers with their expertise
export const getWritersWithExpertise = async () => {
  try {
    const { data: writers, error } = await supabase
      .from('profiles')
      .select(`
        *,
        writer_expertise (
          *,
          subject:subjects (*)
        )
      `)
      .eq('is_writer', true)
      .eq('is_active', true)
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return writers;
    
  } catch (error) {
    console.error('Error fetching writers:', error);
    return [];
  }
};

// Convert old profile format to new format (for migration)
export const migrateProfileData = (oldProfile: any): Partial<Profile> => {
  // Handle old 'full_name' field
  let firstName = null;
  let lastName = null;
  
  if (oldProfile.full_name) {
    const nameParts = oldProfile.full_name.trim().split(' ');
    firstName = nameParts[0] || null;
    lastName = nameParts.slice(1).join(' ') || null;
  }
  
  return {
    first_name: firstName || oldProfile.first_name || null,
    last_name: lastName || oldProfile.last_name || null,
    email: oldProfile.email || null,
    is_writer: oldProfile.is_writer || false,
    bio: oldProfile.bio || null,
    phone: oldProfile.phone || null,
    country: oldProfile.country || null,
    timezone: oldProfile.timezone || 'UTC',
    profile_picture_url: oldProfile.profile_picture_url || null,
    rating: oldProfile.rating || 0,
    total_reviews: oldProfile.total_reviews || 0,
    total_orders_completed: oldProfile.total_orders_completed || 0,
    is_active: oldProfile.is_active !== undefined ? oldProfile.is_active : true,
    last_login_at: oldProfile.last_login_at || null,
  };
};

// Enhanced profile query with related data
export const getEnhancedProfile = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        writer_expertise (
          *,
          subject:subjects (*)
        ),
        orders_as_client:orders!orders_user_id_fkey (
          id,
          title,
          status,
          created_at
        ),
        orders_as_writer:orders!orders_writer_id_fkey (
          id,
          title,
          status,
          created_at
        )
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return profile;
    
  } catch (error) {
    console.error('Error fetching enhanced profile:', error);
    return null;
  }
};

export default {
  getFullName,
  getInitials,
  ensureProfile,
  updateProfile,
  getProfileByUserId,
  getProfileById,
  getWritersWithExpertise,
  migrateProfileData,
  getEnhancedProfile,
};