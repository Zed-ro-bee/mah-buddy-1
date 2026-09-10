# Mah Buddy Native Android

This folder contains the native React Native/Expo Android client for Mah Buddy.

## Important

- This is a native Android client. It does **not** use a WebView.
- The existing web application remains the production backend and web experience.
- The Android client calls the Mah Buddy `/api/chat` endpoint for AI responses.
- Android package: `com.mahbuddy.app`
- EAS project: `mah-buddy`

## Local setup

```bash
cd mobile
npm install
npx expo-doctor
npx expo start
```

For a native Android build with the Android SDK installed:

```bash
npx expo run:android
```

For EAS:

```bash
EAS_SKIP_AUTO_FINGERPRINT=1 eas build --platform android --profile preview
```

The native client must never receive the Gemini API key. AI provider credentials stay on the Mah Buddy server.
