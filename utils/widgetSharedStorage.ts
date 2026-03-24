import { Platform } from 'react-native';
import { reloadWidgetTimelines } from 'expo-widget-reload';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

export const WIDGET_APP_GROUP_ID = 'group.me.amitsarussi.lovenotesapp';

const WIDGET_STATE_KEY = 'widget_state';

/** Syncs progress + viewed notes to the app group so the iOS widget can read them. */
export async function syncWidgetSharedState(
  daysPassed: number,
  viewedNoteIds: number[]
): Promise<void> {
  if (Platform.OS !== 'ios') return;
  const safeDays = Number.isFinite(daysPassed) ? Math.max(0, Math.floor(daysPassed)) : 0;
  const safeIds = viewedNoteIds.filter((n) => Number.isFinite(n)).map((n) => Math.floor(n));
  try {
    await SharedGroupPreferences.setItem(
      WIDGET_STATE_KEY,
      { daysPassed: safeDays, viewedNoteIds: safeIds },
      WIDGET_APP_GROUP_ID
    );
    try {
      await reloadWidgetTimelines();
    } catch (reloadErr) {
      console.warn('reloadWidgetTimelines failed', reloadErr);
    }
  } catch (e) {
    console.warn('syncWidgetSharedState failed', e);
  }
}
