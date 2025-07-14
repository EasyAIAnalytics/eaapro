import { supabase } from './config';

export async function signUpWithEmail(email: string, password: string) {
  return await supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({ provider: 'google' });
}

export async function signInWithGitHub() {
  return await supabase.auth.signInWithOAuth({ provider: 'github' });
}

export async function getCurrentUser() {
  return await supabase.auth.getUser();
} 