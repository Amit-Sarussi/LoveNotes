import { Platform } from 'react-native';
import { ExtensionStorage } from '@bacons/apple-targets';

export const WIDGET_APP_GROUP_ID = 'group.me.amitsarussi.lovenotesapp';

const WIDGET_STATE_KEY = 'widget_state';

const storage = new ExtensionStorage(WIDGET_APP_GROUP_ID);

/** Syncs progress + viewed notes to the app group so the iOS widget can read them. */
export async function syncWidgetSharedState(
  daysPassed: number,
  viewedNoteIds: number[]
): Promise<void> {
  if (Platform.OS !== 'ios') return;

  const safeDays = Number.isFinite(daysPassed) ? Math.max(0, Math.floor(daysPassed)) : 0;
  const safeIds = viewedNoteIds.filter((n) => Number.isFinite(n)).map((n) => Math.floor(n));

  try {
    storage.set(
      WIDGET_STATE_KEY,
      JSON.stringify({
        daysPassed: safeDays,
        viewedNoteIds: safeIds,
        syncedAtIso: new Date().toISOString(),
      })
    );
    ExtensionStorage.reloadWidget();
  } catch (e) {
    console.warn('syncWidgetSharedState failed', e);
  }
}
