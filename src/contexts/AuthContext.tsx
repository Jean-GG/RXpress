import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  user_type: 'client' | 'mechanic';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      return profileData;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchProfile(userData.id).then(setProfile);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      // Simple password check for demo (in production, use proper hashing)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) // Using plain text for demo
        .maybeSingle();

      if (userError) {
        console.error('User query error:', userError);
        return { error: 'Error al verificar las credenciales' };
      }

      if (!userData) {
        return { error: 'Credenciales incorrectas' };
      }

      // Fetch profile
      const profileData = await fetchProfile(userData.id);
      if (!profileData) {
        return { error: 'Error al cargar el perfil del usuario' };
      }

      // Set user and profile
      setUser(userData);
      setProfile(profileData);
      
      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(userData));

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Error al iniciar sesión' };
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<{ error: string | null }> => {
    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        return { error: 'Error al verificar el usuario existente' };
      }

      if (existingUser) {
        return { error: 'El usuario ya existe' };
      }

      const userId = crypto.randomUUID();

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: email,
            password_hash: password, // Using plain text for demo
          }
        ]);

      if (userError) {
        console.error('User creation error:', userError);
        return { error: 'Error al crear el usuario: ' + userError.message };
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: userId,
            email: email,
            full_name: userData.full_name || userData.fullName || '',
            phone: userData.phone || '',
            user_type: userData.user_type || userData.userType || 'client',
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Try to clean up user record if profile creation fails
        await supabase.from('users').delete().eq('id', userId);
        return { error: 'Error al crear el perfil: ' + profileError.message };
      }

      // If user is a mechanic, create mechanic profile
      if ((userData.userType || userData.user_type) === 'mechanic') {
        const { error: mechanicError } = await supabase
          .from('mechanic_profiles')
          .insert([
            {
              user_id: userId,
              specialties: userData.specialties || ['Servicio general'],
              hourly_rate: userData.hourlyRate || 300,
              availability_status: 'available',
            }
          ]);

        if (mechanicError) {
          console.error('Mechanic profile creation error:', mechanicError);
          // Don't return error here as the main profile was created successfully
        }
      }

      // Auto sign in after successful registration
      const { data: newUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const newProfile = await fetchProfile(userId);

      if (newUser && newProfile) {
        setUser(newUser);
        setProfile(newProfile);
        localStorage.setItem('auth_user', JSON.stringify(newUser));
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Error al registrar la cuenta' };
    }
  };

  const signOut = async (): Promise<void> => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('auth_user');
  };

  const updateProfile = async (data: Partial<Profile>): Promise<{ error: string | null }> => {
    if (!user || !profile) {
      return { error: 'Usuario no autenticado' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name || profile.full_name,
          phone: data.phone || profile.phone,
          email: data.email || profile.email,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Update profile error:', error);
        return { error: 'Error al actualizar el perfil' };
      }

      // Update local profile state
      setProfile({
        ...profile,
        ...data,
      });

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'Error al actualizar el perfil' };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};