# Mah Buddy v1.0 Release Gate

This checklist defines what must be verified before Mah Buddy is called release-ready.

## Product
- [ ] AI chat works for new and returning accounts
- [ ] Responses respect age, current studies, goal, learning level, and difficulty
- [ ] Quiz generation works and avoids immediate repeats
- [ ] Flashcard generation works and avoids immediate repeats
- [ ] Voice/TTS works and speaks only intended response content

## Accounts & data
- [ ] Sign-up and sign-in work
- [ ] Profile persists
- [ ] Conversations persist per account
- [ ] Quiz and flashcard state persists per account
- [ ] Sign-out clears active account state
- [ ] Signing back in restores only that account's data
- [ ] No cross-account data exposure

## Reliability
- [ ] TypeScript check passes
- [ ] Production build passes
- [ ] API failure states are user-friendly
- [ ] Loading and empty states are usable
- [ ] Mobile layouts work without overflow

## Security
- [ ] AI/API credentials are server-side only
- [ ] Authentication boundaries are enforced
- [ ] Request and attachment limits are enforced
- [ ] Production errors do not expose secrets
- [ ] Supabase policies are verified for account isolation

## Android
- [ ] Release build installs on a real Android device
- [ ] App icon and package identity are correct
- [ ] Login, chat, quiz, flashcards, voice, settings, and sign-out work
- [ ] Back navigation and keyboard behavior are correct
- [ ] Production URL/configuration is verified

## Release
- [ ] Privacy policy is published
- [ ] Terms are published
- [ ] App metadata and screenshots are ready
- [ ] Production deployment is smoke-tested
- [ ] Final regression pass completed
