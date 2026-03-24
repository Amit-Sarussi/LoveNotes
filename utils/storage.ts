import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDaysPassed, initStartDate } from './startDate';
import { syncWidgetSharedState } from './widgetSharedStorage';

const USER_NAME_KEY = 'USER_NAME';
const VIEWED_NOTES_KEY = 'VIEWED_NOTES';

export const saveUser = async (name: string) => {
  try {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
  } catch (e) {
    console.error("Failed to save user name.", e);
  }
};

export const getUser = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_NAME_KEY);
  } catch (e) {
    console.error("Failed to fetch user name.", e);
    return null;
  }
};

export const clearUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_NAME_KEY);
  } catch (e) {
    console.error("Failed to clear user name.", e);
  }
}

export const getViewedNotes = async (): Promise<number[] | null> => {
  try {
    const viewedNotes = await AsyncStorage.getItem(VIEWED_NOTES_KEY);
    return viewedNotes ? JSON.parse(viewedNotes) : null;
  } catch (e) {
    console.error("Failed to fetch viewed notes.", e);
    return null;
  }
};


export const setViewedNote = async (noteId: number) => {
  try {
    await initStartDate();
    const viewedNotes = await getViewedNotes() || [];
    const updatedNotes = Array.from(new Set([...viewedNotes, noteId]));
    await AsyncStorage.setItem(VIEWED_NOTES_KEY, JSON.stringify(updatedNotes));
    await syncWidgetSharedState(getDaysPassed(), updatedNotes);
  } catch (e) {
    console.error("Failed to set viewed note.", e);
  }
};

export const clearViewedNotes = async () => {
  try {
    await AsyncStorage.removeItem(VIEWED_NOTES_KEY);
  } catch (e) {
    console.error("Failed to clear viewed notes.", e);
  }
}

