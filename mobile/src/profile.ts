import AsyncStorage from '@react-native-async-storage/async-storage';

export type LearningDifficulty = 'easy' | 'normal' | 'hard';

export type BuddyProfile = {
  preferredName: string;
  buddyName: string;
  age: string;
  difficulty: LearningDifficulty;
};

const PROFILE_KEY = 'mah-buddy.profile.v1';

export const DEFAULT_PROFILE: BuddyProfile = {
  preferredName: '',
  buddyName: 'Mah Buddy',
  age: '',
  difficulty: 'normal',
};

export async function loadProfile(): Promise<BuddyProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: BuddyProfile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
