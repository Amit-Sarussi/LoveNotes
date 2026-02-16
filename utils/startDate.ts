const startDate = new Date('2026-2-7');

export const getDaysPassed = () => {
  const today = new Date();
  return Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export const getNormalizedProgress = () => {
  const totalDays = 365;
  const progress = Math.min((getDaysPassed() / totalDays) * 100, 100);

  return Math.max(progress / 100, progress / 200 + 0.02) * 100
}