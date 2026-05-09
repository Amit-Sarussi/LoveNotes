import { fetchStartDate } from './api';

export const MAX_APP_DAY = 50;

let startDate = new Date('2026-3-21');

let initStartDatePromise: Promise<void> | null = null;

/** Fetches start date once (or reuses the in-flight request) so deep links get correct `getDaysPassed`. */
export const initStartDate = async () => {
  if (!initStartDatePromise) {
    initStartDatePromise = (async () => {
      try {
        const fetchedDate = await fetchStartDate();
        startDate = new Date(fetchedDate);
      } catch (error) {
        console.warn('Using fallback startDate due to fetch error:', error);
      }
    })();
  }
  return initStartDatePromise;
};

export const getStartDate = () => startDate;

export const getDaysPassed = () => {
  const today = new Date();
  const dateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const raw = Math.floor(
    (dateOnly(today).getTime() - dateOnly(startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.min(Math.max(raw, 0), MAX_APP_DAY);
}

export const getNormalizedProgress = () => {
  const progress = Math.min((getDaysPassed() / MAX_APP_DAY) * 100, 100);

  return Math.max(progress / 100, progress / 200 + 0.02) * 100
}