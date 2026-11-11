# Mah Buddy — Native Mobile App

This folder is the real mobile application for Mah Buddy. It is **not a WebView wrapper**.

## Stack
- Expo / React Native
- Native Android and iOS UI
- Supabase native authentication/session persistence
- Mah Buddy's existing Vercel API for AI responses

## Setup
1. Install Node.js and Expo tooling.
2. Copy `.env.example` to `.env`.
3. Fill in the Supabase URL and publishable key used by the existing Mah Buddy project.
4. Run `npm install` inside `mobile/`.
5. Run `npx expo start` for development.

## Android builds
- Preview APK: `eas build --platform android --profile preview`
- Google Play AAB: `eas build --platform android --profile production`

The production build is a native Android application. The website is only used as the backend/API endpoint; the mobile UI is rendered by React Native.
