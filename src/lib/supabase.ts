import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string;
          phone: string;
          user_type: 'client' | 'mechanic';
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name: string;
          phone: string;
          user_type: 'client' | 'mechanic';
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string;
          phone?: string;
          user_type?: 'client' | 'mechanic';
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      mechanic_profiles: {
        Row: {
          id: string;
          user_id: string;
          specialties: string[];
          rating: number;
          total_reviews: number;
          hourly_rate: number;
          availability_status: 'available' | 'busy' | 'offline';
          current_latitude?: number;
          current_longitude?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          specialties: string[];
          rating?: number;
          total_reviews?: number;
          hourly_rate: number;
          availability_status?: 'available' | 'busy' | 'offline';
          current_latitude?: number;
          current_longitude?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          specialties?: string[];
          rating?: number;
          total_reviews?: number;
          hourly_rate?: number;
          availability_status?: 'available' | 'busy' | 'offline';
          current_latitude?: number;
          current_longitude?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      service_requests: {
        Row: {
          id: string;
          client_id: string;
          mechanic_id?: string;
          service_type: string;
          description: string;
          client_latitude: number;
          client_longitude: number;
          client_address: string;
          status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          payment_method: 'cash' | 'card';
          estimated_cost: number;
          actual_cost?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          mechanic_id?: string;
          service_type: string;
          description: string;
          client_latitude: number;
          client_longitude: number;
          client_address: string;
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          payment_method: 'cash' | 'card';
          estimated_cost: number;
          actual_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          mechanic_id?: string;
          service_type?: string;
          description?: string;
          client_latitude?: number;
          client_longitude?: number;
          client_address?: string;
          status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
          payment_method?: 'cash' | 'card';
          estimated_cost?: number;
          actual_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          service_request_id: string;
          sender_id: string;
          message: string;
          message_type: 'text' | 'image' | 'system';
          created_at: string;
        };
        Insert: {
          id?: string;
          service_request_id: string;
          sender_id: string;
          message: string;
          message_type?: 'text' | 'image' | 'system';
          created_at?: string;
        };
        Update: {
          id?: string;
          service_request_id?: string;
          sender_id?: string;
          message?: string;
          message_type?: 'text' | 'image' | 'system';
          created_at?: string;
        };
      };
    };
  };
};