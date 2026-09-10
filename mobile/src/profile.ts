import AsyncStorage from '@react-native-async-storage/async-storage';

export type LearningDifficulty = 'easy' | 'normal' | 'hard';

export type BuddyProfile = {
  preferredName: string;
  buddyName: string;
  age: string;
  difficulty: LearningDifficulty;
};

const profileKey = (userId: string) => `mah-buddy.profile.v1.${userId}`;

export const DEFAULT_PROFILE: BuddyProfile = {
  preferredName: '',
  buddyName: 'Mah Buddy',
  age: '',
  difficulty: 'normal',
};

export async function loadProfile(userId: string): Promise<BuddyProfile> {
  try {
    const raw = await AsyncStorage.getItem(profileKey(userId));
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(userId: string, profile: BuddyProfile) {
  await AsyncStorage.setItem(profileKey(userId), JSON.stringify(profile));
}
