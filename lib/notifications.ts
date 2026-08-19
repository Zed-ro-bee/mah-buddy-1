export async function registerMahBuddyNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  try {
    await navigator.serviceWorker.register('/notification-worker.js');
    return true;
  } catch {
    return false;
  }
}

export async function requestMahBuddyNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export async function notifyMahBuddy(title: string, body: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({ type: 'MAH_BUDDY_NOTIFY', title, body });
  return true;
}
