import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Derives the base LAN host IP of the development machine:
 * - On Expo Go, Constants.expoConfig?.hostUri or debuggerHost
 *   yields something like "10.51.121.145:8081".
 * - We extract the IP and target port 8000 (Django default).
 */
export const getBackendRootUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/api\/?$/, '').replace(/\/$/, '');
    // If running on a physical device and envUrl is 10.0.2.2, bypass and resolve true LAN host
    if (Platform.OS !== 'web' && !trimmed.includes('10.0.2.2')) {
      return trimmed;
    }
    if (Platform.OS === 'web') {
      return trimmed;
    }
  }

  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:8000';
    }

    // Expo Go host discovery from all known SDK fields
    const candidateUri = 
      Constants.expoGoConfig?.debuggerHost ||
      Constants.expoConfig?.hostUri || 
      (Constants as any).manifest?.debuggerHost || 
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
      Constants.experienceUrl ||
      Constants.linkingUri;

    if (candidateUri) {
      // Handles both "10.51.121.145:8081" and "exp://10.51.121.145:8081"
      const cleaned = candidateUri.replace(/^[a-zA-Z]+:\/\//, '');
      const hostIp = cleaned.split(':')[0].split('/')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return `http://${hostIp}:8000`;
      }
    }

    // Known developer LAN host IP fallback
    return 'http://10.51.121.145:8000';
  }

  return 'http://10.51.121.145:8000';
};

/**
 * Returns the REST API Base URL with trailing slash, e.g. "http://10.51.121.145:8000/api/"
 */
export const getApiBaseUrl = (): string => {
  const root = getBackendRootUrl();
  return `${root}/api/`;
};

/**
 * Returns the WebSocket URL for real-time Django Channels connections.
 * e.g. "ws://10.51.121.145:8000/ws/chat/global/?token=..."
 */
export const getWsUrl = (token?: string | null): string => {
  const root = getBackendRootUrl();
  const wsBase = root.replace(/^https?:\/\//, (match) => match.startsWith('https') ? 'wss://' : 'ws://');
  const path = `${wsBase}/ws/chat/global/`;
  return token ? `${path}?token=${token}` : path;
};

/**
 * Resolves media and image URLs returned from Django:
 * - If backend returns relative "/media/...", prepends backend root URL.
 * - If backend returns "http://localhost:8000/media/..." on a physical device,
 *   re-maps localhost to the physical device reachable LAN host.
 */
export const resolveMediaUrl = (url?: string | null): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const backendRoot = getBackendRootUrl();

  // If already absolute
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // If device is native and URL points to localhost/127.0.0.1/10.0.2.2, rewrite to LAN host
    if (Platform.OS !== 'web' && (trimmed.includes('localhost:8000') || trimmed.includes('127.0.0.1:8000') || trimmed.includes('10.0.2.2:8000'))) {
      return trimmed
        .replace('http://localhost:8000', backendRoot)
        .replace('http://127.0.0.1:8000', backendRoot)
        .replace('http://10.0.2.2:8000', backendRoot);
    }
    return trimmed;
  }

  // Relative path like "/media/..." or "media/..."
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendRoot}${cleanPath}`;
};

/**
 * Safe development diagnostic logger.
 * Never logs passwords or JWT secrets.
 */
export const logApiDiagnostic = (action: string, meta: Record<string, any> = {}) => {
  if (__DEV__) {
    console.log(`[Farmket API] ${action}`, meta);
  }
};
