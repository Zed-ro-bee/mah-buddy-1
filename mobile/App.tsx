import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://mah-buddy.vercel.app";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "Hey 👋 I’m Mah Buddy. What can I help you with today?" },
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setBooting(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  const canUseAuth = useMemo(() => Boolean(SUPABASE_URL && SUPABASE_KEY), []);

  async function sendCode() {
    if (!email.trim()) return Alert.alert("Email required", "Enter your email address first.");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    if (error) return Alert.alert("Could not send code", error.message);
    setOtpSent(true);
    Alert.alert("Code sent", "Check your email for the confirmation code.");
  }

  async function verifyCode() {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp.trim(), type: "email" });
    if (error) Alert.alert("Invalid code", error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMessages([{ id: "welcome", role: "assistant", content: "Hey 👋 I’m Mah Buddy. What can I help you with today?" }]);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const userMessage: Message = { id: `${Date.now()}-u`, role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setSending(true);
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Mah Buddy could not respond.");
      setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", content: data.text || "I’m here — try asking that another way." }]);
    } catch (error) {
      setMessages((current) => [...current, { id: `${Date.now()}-e`, role: "assistant", content: error instanceof Error ? error.message : "Something went wrong." }]);
    } finally { setSending(false); }
  }

  if (booting) return <View style={styles.center}><ActivityIndicator size="large" /><Text style={styles.muted}>Starting Mah Buddy…</Text></View>;

  if (!session) return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.authCard}>
        <View style={styles.logo}><Text style={styles.logoText}>m</Text></View>
        <Text style={styles.title}>Mah Buddy</Text>
        <Text style={styles.subtitle}>Your personal AI buddy and study companion.</Text>
        {!canUseAuth ? <Text style={styles.error}>Add the Supabase environment variables before using sign in.</Text> : null}
        <TextInput value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        {otpSent && <TextInput value={otp} onChangeText={setOtp} placeholder="Confirmation code" keyboardType="number-pad" style={styles.input} />}
        <Pressable disabled={!canUseAuth} onPress={otpSent ? verifyCode : sendCode} style={styles.primary}><Text style={styles.primaryText}>{otpSent ? "Verify code" : "Send confirmation code"}</Text></Pressable>
        {otpSent && <Pressable onPress={sendCode}><Text style={styles.link}>Send a new code</Text></Pressable>}
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}><View><Text style={styles.headerTitle}>Mah Buddy</Text><Text style={styles.online}>AI study companion</Text></View><Pressable onPress={signOut}><Text style={styles.signOut}>Sign out</Text></Pressable></View>
        <FlatList data={messages} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.aiBubble]}><Text style={styles.bubbleText}>{item.content}</Text></View>} />
        {sending && <View style={styles.typing}><ActivityIndicator size="small" /><Text style={styles.muted}>Mah Buddy is thinking…</Text></View>}
        <View style={styles.composer}><TextInput value={input} onChangeText={setInput} placeholder="Message Mah Buddy…" multiline style={styles.composerInput} /><Pressable onPress={sendMessage} disabled={!input.trim() || sending} style={styles.send}><Text style={styles.sendText}>↑</Text></Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f7f5" },
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#f7f7f5" },
  authCard: { margin: 24, marginTop: 80, padding: 26, borderRadius: 28, backgroundColor: "#fff", shadowOpacity: 0.08, shadowRadius: 18, elevation: 3 },
  logo: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "#111" },
  logoText: { color: "#fff", fontSize: 34, fontWeight: "700" },
  title: { marginTop: 18, fontSize: 34, fontWeight: "700", color: "#171717" },
  subtitle: { marginTop: 8, marginBottom: 24, fontSize: 16, lineHeight: 23, color: "#666" },
  input: { backgroundColor: "#f1f1ef", borderRadius: 14, padding: 16, fontSize: 16, marginBottom: 12 },
  primary: { backgroundColor: "#111", borderRadius: 14, padding: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { textAlign: "center", marginTop: 16, fontWeight: "600" },
  error: { color: "#a33", marginBottom: 14 },
  header: { paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#e7e7e4", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 21, fontWeight: "700" },
  online: { color: "#777", marginTop: 2 },
  signOut: { fontWeight: "600" },
  list: { padding: 16, gap: 12 },
  bubble: { maxWidth: "88%", padding: 14, borderRadius: 19 },
  aiBubble: { alignSelf: "flex-start", backgroundColor: "#fff", borderWidth: 1, borderColor: "#e8e8e5" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#e9e9e5" },
  bubbleText: { fontSize: 16, lineHeight: 23, color: "#171717" },
  typing: { flexDirection: "row", gap: 8, paddingHorizontal: 18, paddingBottom: 8, alignItems: "center" },
  muted: { color: "#777" },
  composer: { margin: 12, padding: 7, paddingLeft: 15, borderRadius: 22, backgroundColor: "#fff", borderWidth: 1, borderColor: "#dededb", flexDirection: "row", alignItems: "flex-end" },
  composerInput: { flex: 1, maxHeight: 110, paddingVertical: 9, fontSize: 16 },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#111", alignItems: "center", justifyContent: "center" },
  sendText: { color: "#fff", fontSize: 22, fontWeight: "700" },
});
