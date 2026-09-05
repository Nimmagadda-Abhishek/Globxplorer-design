/**
 * Web Push Notification utility
 *
 * Handles:
 *  - Service worker registration
 *  - Requesting browser Notification permission
 *  - Creating a PushManager subscription using the VAPID public key
 *  - Sending the subscription to the backend
 *  - Unsubscribing
 */

const BASE_URL = 'http://localhost:4000/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a URL-safe Base64 VAPID public key into a Uint8Array */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Get the auth token from localStorage */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/** Encode an ArrayBuffer to a Base64 string */
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Fetches the VAPID public key from the backend.
 * Falls back to the VITE_VAPID_PUBLIC_KEY env variable if the endpoint is
 * not available.
 */
async function getVapidPublicKey(): Promise<string | null> {
  // 1. Try env variable first (fastest, no network)
  const envKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (envKey) return envKey;

  // 2. Try fetching from backend
  try {
    const res = await fetch(`${BASE_URL}/notifications/vapid-public-key`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.key || data.publicKey || null;
    }
  } catch (err) {
    console.warn('[WebPush] Could not fetch VAPID key from server', err);
  }

  return null;
}

/**
 * Register the Service Worker. Returns the ServiceWorkerRegistration, or
 * null if the browser does not support the required APIs.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[WebPush] Browser does not support Service Workers or Push API');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[WebPush] Service Worker registered', registration.scope);
    return registration;
  } catch (err) {
    console.error('[WebPush] Service Worker registration failed', err);
    return null;
  }
}

/**
 * Request Notification permission, create a PushSubscription, and send it
 * to the backend.
 *
 * @returns `true` if the subscription was successfully created and stored.
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
): Promise<boolean> {
  // 1. Ask user for permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[WebPush] Notification permission denied');
    return false;
  }

  // 2. Get VAPID public key
  const vapidPublicKey = await getVapidPublicKey();
  if (!vapidPublicKey) {
    console.error('[WebPush] No VAPID public key available. Set VITE_VAPID_PUBLIC_KEY in .env or expose /api/notifications/vapid-public-key.');
    return false;
  }

  // 3. Subscribe through PushManager
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // 4. Send subscription details to backend
    const rawKey = subscription.getKey('p256dh');
    const rawAuth = subscription.getKey('auth');

    const payload = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(rawKey),
        auth: arrayBufferToBase64(rawAuth),
      },
    };

    const res = await fetch(`${BASE_URL}/notifications/push-subscription`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('[WebPush] Failed to save subscription on server', await res.text());
      return false;
    }

    console.log('[WebPush] Push subscription stored on server');
    return true;
  } catch (err) {
    console.error('[WebPush] Subscription failed', err);
    return false;
  }
}

/**
 * Unsubscribe from push notifications and remove the subscription from the
 * backend.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('[WebPush] No active subscription to unsubscribe');
      return true;
    }

    // Remove from backend
    await fetch(`${BASE_URL}/notifications/push-subscription`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    // Unsubscribe locally
    const success = await subscription.unsubscribe();
    console.log('[WebPush] Unsubscribed', success);
    return success;
  } catch (err) {
    console.error('[WebPush] Unsubscribe failed', err);
    return false;
  }
}

/**
 * Check whether the user currently has an active push subscription.
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}

/**
 * Get the current Notification permission state.
 */
export function getPushPermissionState(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Convenience: register SW + subscribe in one call.
 * Designed to be called from a "Enable push notifications" button.
 */
export async function enablePushNotifications(): Promise<boolean> {
  const registration = await registerServiceWorker();
  if (!registration) return false;
  return subscribeToPush(registration);
}
