import { createClient } from 'https://aistudiocdn.com/@supabase/supabase-js@^2.44.4';
import { User } from '../types';

const supabaseUrl = 'https://ewmcyzqiovoqinenvkba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bWN5enFpb3ZvcWluZW52a2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODMwODcsImV4cCI6MjA3ODk1OTA4N30.xFENkTX9Ch-7huCw4sJxCiSB-RIvkOaa7YeMfrX0Nj8';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to map Supabase user to our app's User type
export const mapSupabaseUserToAppUser = (supabaseUser: any, role: 'admin' | 'tecnico' = 'tecnico'): User => {
    // This helper is mainly for the createUser flow where we get the auth user back immediately.
    // For login, we fetch the full profile for security.
    return {
        id: supabaseUser.id, // Supabase user object has an 'id' which is a string (UUID)
        name: supabaseUser.user_metadata?.name || supabaseUser.email,
        email: supabaseUser.email, // Use email as the username
        role: supabaseUser.user_metadata?.role || role,
        createdAt: supabaseUser.created_at,
    };
};
