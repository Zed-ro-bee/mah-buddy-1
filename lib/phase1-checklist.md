# Mah Buddy Phase 1 Foundation

- [x] Supabase profiles/settings/conversations/messages schema
- [x] Row-level security policies
- [x] Automatic profile/settings creation on signup
- [x] Conversation/message/settings data helpers
- [x] Voice input/output browser foundation
- [x] AI chat route uses server-side Gemini key
- [x] TTS route keeps provider key server-side
- [x] Friendly API error handling
- [x] App health capability checks
- [ ] Wire all persistence helpers into the live page (follow-up integration pass)
- [ ] Verify auth recovery/verification flow in production
- [ ] Verify environment variables on Vercel
- [ ] Run production build after Vercel rate-limit clears

## Provider note

The app's chat provider is Gemini via `GOOGLE_GENERATIVE_AI_API_KEY`. TTS currently uses the server-side `OPENAI_API_KEY`; if that key is unavailable, the client falls back to browser speech synthesis. No provider secret should be exposed in client-side code.
