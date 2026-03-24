import { fetchStartDate } from './api';

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
  return Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export const getNormalizedProgress = () => {
  const totalDays = 365;
  const progress = Math.min((getDaysPassed() / totalDays) * 100, 100);

  return Math.max(progress / 100, progress / 200 + 0.02) * 100
}