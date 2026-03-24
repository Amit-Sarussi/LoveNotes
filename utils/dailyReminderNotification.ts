import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const DAILY_REMINDER_NOTIFICATION_ID = 'daily-new-note-reminder';
const ANDROID_CHANNEL_ID = 'daily-reminders';

const REMINDER_BODY = 'יש לך פתק חדש לקרוא!';

let handlerConfigured = false;

function ensureNotificationHandler() {
  if (handlerConfigured || Platform.OS === 'web') return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Requests permission (when needed), then registers one repeating local notification
 * every day at 7:00 in the device’s local timezone.
 */
export async function setupDailyReminderNotification(): Promise<void> {
  if (Platform.OS === 'web') return;

  ensureNotificationHandler();

  const { status: existing } = await Notifications.getPermissionsAsync();
  const { status } =
    existing === 'granted' ? { status: existing } : await Notifications.requestPermissionsAsync();

  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Daily reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_NOTIFICATION_ID);

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_NOTIFICATION_ID,
    content: {
      title: 'Love Notes',
      body: REMINDER_BODY,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
  });
}
