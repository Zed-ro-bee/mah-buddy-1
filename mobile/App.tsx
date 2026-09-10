import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, Session } from '@supabase/supabase-js';
import { DEFAULT_PROFILE, BuddyProfile, loadProfile, saveProfile } from './src/profile';

type Message = { id: string; role: 'user' | 'assistant'; content: string };
const extra = (Constants.expoConfig?.extra || {}) as Record<string, string | undefined>;
const API_BASE_URL = String(extra.apiBaseUrl || 'https://mah-buddy.vercel.app').replace(/\/$/, '');
const SUPABASE_URL = String(extra.supabaseUrl || '');
const SUPABASE_KEY = String(extra.supabasePublishableKey || '');
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }) : null;
const historyKey = (userId: string) => `mah-buddy.native.history.v1.${userId}`;
const welcome = (profile: BuddyProfile) => `Hi${profile.preferredName ? ` ${profile.preferredName}` : ''}, I’m ${profile.buddyName || 'Mah Buddy'}. What would you like to learn or work on?`;

async function readHistory(userId: string, profile: BuddyProfile): Promise<Message[]> {
  try {
    const raw = await AsyncStorage.getItem(historyKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return [{ id: 'welcome', role: 'assistant', content: welcome(profile) }];
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BuddyProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    if (!supabase) { setBooting(false); return; }
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        const p = await loadProfile();
        setProfile(p);
        setMessages(await readHistory(data.session.user.id, p));
      }
      setBooting(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) { setMessages([]); setProfile(DEFAULT_PROFILE); }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    void AsyncStorage.setItem(historyKey(session.user.id), JSON.stringify(messages));
  }, [messages, session]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function signIn() {
    if (!supabase) return Alert.alert('Setup needed', 'The native app needs the Supabase URL and publishable key in its environment configuration.');
    if (!email.trim() || !password) return Alert.alert('Missing details', 'Enter your email and password.');
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthBusy(false);
    if (error) Alert.alert('Sign in failed', error.message);
  }

  async function signUp() {
    if (!supabase) return Alert.alert('Setup needed', 'The native app needs the Supabase URL and publishable key in its environment configuration.');
    if (!email.trim() || !password) return Alert.alert('Missing details', 'Enter your email and password.');
    if (password.length < 6) return Alert.alert('Password too short', 'Use at least 6 characters.');
    setAuthBusy(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setAuthBusy(false);
    if (error) return Alert.alert('Sign up failed', error.message);
    if (!data.session) Alert.alert('Check your email', 'Your account was created. Complete email verification if your project requires it, then sign in.');
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setMessages([]);
    setProfile(DEFAULT_PROFILE);
  }

  async function editProfile() {
    const next: BuddyProfile = {
      ...profile,
      preferredName: profile.preferredName,
      buddyName: profile.buddyName || 'Mah Buddy',
      age: profile.age,
      difficulty: profile.difficulty,
    };
    await saveProfile(next);
    setProfile(next);
    setMessages((current) => current.length === 1 && current[0].id === 'welcome' ? [{ id: 'welcome', role: 'assistant', content: welcome(next) }] : current);
    Alert.alert('Profile saved', 'Your learning preferences are saved on this device.');
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || !session) return;
    const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages); setInput(''); setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Mah Buddy could not respond right now.');
      setMessages((current) => [...current, { id: `${Date.now()}-a`, role: 'assistant', content: String(data.text || '') }]);
    } catch (error) {
      setMessages((current) => [...current, { id: `${Date.now()}-e`, role: 'assistant', content: error instanceof Error ? error.message : 'Connection error. Please try again.' }]);
    } finally { setLoading(false); }
  }

  if (booting) return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator /><Text style={styles.muted}>Starting Mah Buddy…</Text></View></SafeAreaView>;

  if (!session) return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.authContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.authCard}>
          <Text style={styles.title}>Mah Buddy</Text>
          <Text style={styles.subtitle}>Your AI study buddy</Text>
          <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#8a8f98" style={styles.authInput} />
          <TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#8a8f98" style={styles.authInput} />
          <Pressable disabled={authBusy} onPress={signIn} style={styles.primary}><Text style={styles.primaryText}>{authBusy ? 'Please wait…' : 'Sign in'}</Text></Pressable>
          <Pressable disabled={authBusy} onPress={signUp} style={styles.secondary}><Text style={styles.secondaryText}>Create account</Text></Pressable>
          {!supabase && <Text style={styles.setup}>Native authentication is awaiting Supabase environment configuration.</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View><Text style={styles.title}>{profile.buddyName || 'Mah Buddy'}</Text><Text style={styles.subtitle}>{profile.preferredName ? `Ready to help, ${profile.preferredName}` : 'Your AI study buddy'}</Text></View>
          <View style={styles.headerActions}><Pressable onPress={editProfile}><Text style={styles.action}>Profile</Text></Pressable><Pressable onPress={signOut}><Text style={styles.signOut}>Sign out</Text></Pressable></View>
        </View>
        <FlatList style={styles.list} contentContainerStyle={styles.messages} data={messages} keyExtractor={(item) => item.id} renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}><Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>{item.content}</Text></View>
        )} />
        {loading && <View style={styles.typing}><ActivityIndicator size="small" /><Text style={styles.typingText}>Mah Buddy is thinking…</Text></View>}
        <View style={styles.composer}>
          <TextInput value={input} onChangeText={setInput} placeholder="Ask Mah Buddy anything…" placeholderTextColor="#8a8f98" style={styles.input} multiline maxLength={8000} />
          <Pressable onPress={sendMessage} disabled={!canSend} style={[styles.send, !canSend && styles.sendDisabled]}><Text style={styles.sendText}>↑</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f8' }, container: { flex: 1 },
  authContainer: { flex: 1, justifyContent: 'center', padding: 20 }, authCard: { backgroundColor: '#fff', borderRadius: 22, padding: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e0e2e6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  header: { paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#d9dce1', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 14 }, action: { color: '#17181b', fontSize: 13, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#17181b' }, subtitle: { marginTop: 2, fontSize: 12, color: '#70757d' }, signOut: { color: '#60656d', fontSize: 13 },
  authInput: { height: 48, borderWidth: 1, borderColor: '#d7d9de', borderRadius: 13, paddingHorizontal: 14, marginTop: 12, color: '#17181b', backgroundColor: '#fff' },
  primary: { marginTop: 16, height: 48, borderRadius: 14, backgroundColor: '#17181b', alignItems: 'center', justifyContent: 'center' }, primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { marginTop: 10, height: 46, borderRadius: 14, borderWidth: 1, borderColor: '#d7d9de', alignItems: 'center', justifyContent: 'center' }, secondaryText: { color: '#17181b', fontWeight: '600' }, setup: { marginTop: 14, color: '#8a8f98', fontSize: 12, textAlign: 'center' },
  list: { flex: 1 }, messages: { padding: 16, gap: 10 }, bubble: { maxWidth: '88%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 17 }, assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: '#e0e2e6' }, userBubble: { alignSelf: 'flex-end', backgroundColor: '#17181b' }, bubbleText: { fontSize: 15, lineHeight: 22, color: '#24262b' }, userText: { color: '#fff' },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingBottom: 8 }, typingText: { fontSize: 12, color: '#70757d' }, muted: { fontSize: 13, color: '#70757d' },
  composer: { margin: 12, padding: 8, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: '#d7d9de', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'flex-end' }, input: { flex: 1, minHeight: 42, maxHeight: 120, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8, fontSize: 15, color: '#17181b' }, send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#17181b' }, sendDisabled: { opacity: 0.35 }, sendText: { color: '#fff', fontSize: 23, lineHeight: 25, fontWeight: '700' }
});
