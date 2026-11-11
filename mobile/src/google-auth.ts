import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase-client';

let configured = false;

export function configureGoogleSignIn(webClientId: string) {
  if (!webClientId || configured) return;
  GoogleSignin.configure({ webClientId });
  configured = true;
}

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error('Google sign-in was cancelled or did not return an ID token.');
  }
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: response.data.idToken,
  });
  if (error) throw error;
}
