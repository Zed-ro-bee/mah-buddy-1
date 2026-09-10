export default ({ config }) => ({
  ...config,
  name: 'Mah Buddy',
  slug: 'mah-buddy',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/mah-buddy-logo.svg',
  android: {
    ...config.android,
    package: 'com.mahbuddy.app',
    versionCode: 1,
    icon: './assets/mah-buddy-logo.svg',
    adaptiveIcon: {
      ...(config.android?.adaptiveIcon || {}),
      foregroundImage: './assets/mah-buddy-logo.svg',
      backgroundColor: '#FFFFFF',
    },
    permissions: ['RECORD_AUDIO'],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'mahbuddy' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  extra: {
    ...(config.extra || {}),
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://mah-buddy.vercel.app',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
  },
});
