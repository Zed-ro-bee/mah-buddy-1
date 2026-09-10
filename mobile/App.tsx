import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Constants from 'expo-constants';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

const API_BASE_URL = String(Constants.expoConfig?.extra?.apiBaseUrl || 'https://mah-buddy.vercel.app').replace(/\/$/, '');

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: 'Hi, I’m Mah Buddy. What would you like to learn or work on?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const userMessage: Message = { id: `${Date.now()}-u`, role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Mah Buddy could not respond right now.');
      setMessages((current) => [...current, { id: `${Date.now()}-a`, role: 'assistant', content: String(data.text || '') }]);
    } catch (error) {
      setMessages((current) => [...current, { id: `${Date.now()}-e`, role: 'assistant', content: error instanceof Error ? error.message : 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mah Buddy</Text>
            <Text style={styles.subtitle}>Your AI study buddy</Text>
          </View>
          <View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>Ready</Text></View>
        </View>

        <FlatList
          style={styles.list}
          contentContainerStyle={styles.messages}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>{item.content}</Text>
            </View>
          )}
        />

        {loading && <View style={styles.typing}><ActivityIndicator size="small" /><Text style={styles.typingText}>Mah Buddy is thinking…</Text></View>}

        <View style={styles.composer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask Mah Buddy anything…"
            placeholderTextColor="#8a8f98"
            style={styles.input}
            multiline
            maxLength={8000}
            onSubmitEditing={sendMessage}
          />
          <Pressable onPress={sendMessage} disabled={!canSend} style={[styles.send, !canSend && styles.sendDisabled]}>
            <Text style={styles.sendText}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f8' },
  container: { flex: 1 },
  header: { paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#d9dce1', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#17181b' },
  subtitle: { marginTop: 2, fontSize: 12, color: '#70757d' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#28a745' },
  statusText: { fontSize: 12, color: '#60656d' },
  list: { flex: 1 },
  messages: { padding: 16, gap: 10 },
  bubble: { maxWidth: '88%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 17 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: StyleSheet.hairlineWidth, borderColor: '#e0e2e6' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#17181b' },
  bubbleText: { fontSize: 15, lineHeight: 22, color: '#24262b' },
  userText: { color: '#fff' },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingBottom: 8 },
  typingText: { fontSize: 12, color: '#70757d' },
  composer: { margin: 12, padding: 8, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: '#d7d9de', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'flex-end' },
  input: { flex: 1, minHeight: 42, maxHeight: 120, paddingHorizontal: 10, paddingTop: 10, paddingBottom: 8, fontSize: 15, color: '#17181b' },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#17181b' },
  sendDisabled: { opacity: 0.35 },
  sendText: { color: '#fff', fontSize: 23, lineHeight: 25, fontWeight: '700' },
});
