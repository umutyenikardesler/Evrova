import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface PushTokens {
  expoPushToken?: string;
  /** Android: FCM token, iOS: APNs token */
  devicePushToken?: string;
}

const supported = Platform.OS === 'android' || Platform.OS === 'ios';

if (supported) {
  // Uygulama açıkken de bildirim banner'ı göster.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** İzin ister; kanalı oluşturur. true => bildirim izni var. */
export async function ensurePermission(): Promise<boolean> {
  if (!supported) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Evrova',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#B9F227',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** Cihaz token'larını alır (Firestore'a yazılır, Cloud Function bunlarla bildirim yollar). */
export async function getPushTokens(): Promise<PushTokens> {
  const tokens: PushTokens = {};
  if (!supported || !Device.isDevice) return tokens; // simülatörde push yok
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    tokens.expoPushToken = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
  } catch (e) {
    console.warn('[push] expo token:', (e as Error).message);
  }
  try {
    tokens.devicePushToken = String((await Notifications.getDevicePushTokenAsync()).data);
  } catch (e) {
    console.warn('[push] device token:', (e as Error).message);
  }
  return tokens;
}

export interface NotificationTarget {
  kind?: 'price' | 'news' | 'system';
  newsId?: string;
  vehicleId?: string;
}

/** Bildirime dokunulunca (uygulama açıkken/arka planda/kapalıyken) çağrılır. */
export function onNotificationOpened(cb: (target: NotificationTarget) => void): () => void {
  if (!supported) return () => {};
  const handle = (r: Notifications.NotificationResponse) =>
    cb((r.notification.request.content.data ?? {}) as NotificationTarget);

  const sub = Notifications.addNotificationResponseReceivedListener(handle);
  const last = Notifications.getLastNotificationResponse();
  if (last) handle(last);
  return () => sub.remove();
}
