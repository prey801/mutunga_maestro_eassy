


import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { ensureProfile, getFullName, getInitials } from '@/lib/profileUtils';

const AuthContext = createContext(undefined);

export const EnhancedAuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    if (session?.user) {
      const userProfile = await ensureProfile(session.user);
      setProfile(userProfile);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await ensureProfile(user);
      setProfile(userProfile);
    }
  }, [user]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSession(session);
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleSession(session);
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: "You have been successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been successfully signed out.",
          });
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [handleSession, toast]);

  const signUp = useCallback(async (email, password, options) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options,
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up Failed",
          description: error.message || "Something went wrong",
        });
      } else {
        toast({
          title: "Sign up Successful!",
          description: "Please check your email for verification.",
        });
      }
      return { data, error };
    } catch (err) {
      const error = { message: err.message || "An unexpected error occurred" };
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message,
      });
      return { data: null, error };
    }
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in Failed",
          description: error.message || "Something went wrong",
        });
      }
      return { data, error };
    } catch (err) {
      const error = { message: err.message || "An unexpected error occurred" };
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message,
      });
      return { data: null, error };
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign out Failed",
          description: error.message || "Something went wrong",
        });
      }
      return { error };
    } catch (err) {
      const error = { message: err.message || "An unexpected error occurred" };
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message,
      });
      return { error };
    }
  }, [toast]);

  const resetPasswordForEmail = useCallback(async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Password Reset Failed",
          description: error.message || "Something went wrong",
        });
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for password reset instructions.",
        });
      }
      return { data, error };
    } catch (err) {
      const error = { message: err.message || "An unexpected error occurred" };
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: error.message,
      });
      return { data: null, error };
    }
  }, [toast]);

  const updatePassword = useCallback(async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({
          variant: "destructive",
          title: "Password Update Failed",
          description: error.message || "Something went wrong",
        });
      } else {
        toast({
          title: "Success!",
          description: "Your password has been updated successfully.",
        });
      }
      return { data, error };
    } catch (err) {
      const error = { message: err.message || "An unexpected error occurred" };
      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description: error.message,
      });
      return { data: null, error };
    }
  }, [toast]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return null;
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) {
        toast({
          variant: "destructive",
          title: "Profile Update Failed",
          description: error.message || "Something went wrong",
        });
        return null;
      }
      setProfile(updatedProfile);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      return updatedProfile;
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Profile Update Failed",
        description: err.message || "An unexpected error occurred",
      });
      return null;
    }
  }, [user, toast]);

  const getDisplayName = useCallback(() => {
    return getFullName(profile) || user?.email?.split('@')[0] || 'User';
  }, [profile, user]);

  const getUserInitials = useCallback(() => {
    return getInitials(profile);
  }, [profile]);

  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPasswordForEmail,
    updatePassword,
    updateProfile,
    getDisplayName,
    getInitials: getUserInitials,
    refreshProfile,
  }), [
    user, 
    profile, 
    session, 
    loading, 
    signUp, 
    signIn, 
    signOut, 
    resetPasswordForEmail, 
    updatePassword, 
    updateProfile,
    getDisplayName,
    getUserInitials,
    refreshProfile
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useEnhancedAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const useAuth = useEnhancedAuth;