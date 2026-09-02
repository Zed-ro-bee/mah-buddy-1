# Mah Buddy v1.0

AI-powered study companion for personalized learning.

## v1.0 core features

- AI study chat powered by a server-side AI route
- Personalized responses using age, studies, learning level, goal, and difficulty
- Account-based persistence and restoration
- Quiz generation with configurable difficulty and question count
- Flashcard generation with configurable difficulty and card count
- Voice/TTS support
- User profile and learning preferences
- Web/PWA experience
- Android packaging
- Public About/Facts information pages

## v1.0 quality goal

Mah Buddy v1.0 is being hardened toward release quality. The release gate is not simply that a feature exists: authentication, account isolation, persistence, AI routes, learning tools, voice, responsive UI, Android behavior, production configuration, and error states must be verified together.

## Development

```bash
npm install
npm run typecheck
npm run build
npm run start
```

AI credentials remain server-side. Production deployment is intended for Vercel, with the Android package configured for the production application.
