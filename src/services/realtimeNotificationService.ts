import Pusher from 'pusher-js';
import type { NotificationBroadcastPayload } from '../types/notification';

export function subscribeToUserNotifications(
  userId: number,
  token: string,
  onNotification: (notification: NotificationBroadcastPayload['notification']) => void,
): () => void {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!key || !apiUrl) {
    console.warn('Realtime notifications are not configured for the web app.');
    return () => undefined;
  }

  const apiOrigin = new URL(apiUrl).origin;
  const host = import.meta.env.VITE_REVERB_HOST || new URL(apiUrl).hostname;
  const port = Number(import.meta.env.VITE_REVERB_PORT || 8080);
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
  const pusher = new Pusher(key, {
    cluster: 'mt1',
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: scheme === 'https' ? ['wss'] : ['ws'],
    channelAuthorization: {
      endpoint: `${apiOrigin}/api/broadcasting/auth`,
      transport: 'ajax',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  const channel = pusher.subscribe(`private-users.${userId}`);
  channel.bind(
    'notification.created',
    (payload: NotificationBroadcastPayload) => onNotification(payload.notification),
  );

  return () => {
    channel.unbind('notification.created');
    pusher.unsubscribe(`private-users.${userId}`);
    pusher.disconnect();
  };
}
