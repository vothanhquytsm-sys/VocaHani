export interface SM2Result {
  easinessFactor: number;
  repetitions: number;
  intervalDays: number;
  nextReviewDate: string; // ISO String format
}

export function calculateSM2(
  quality: number,
  currentEF: number = 2.5,
  currentRepetitions: number = 0,
  currentIntervalDays: number = 1
): SM2Result {
  let ef = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ef < 1.3) ef = 1.3;

  let repetitions = currentRepetitions;
  let intervalDays = currentIntervalDays;

  if (quality >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * ef);
    }
    repetitions++;
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    easinessFactor: parseFloat(ef.toFixed(4)),
    repetitions,
    intervalDays,
    nextReviewDate: nextDate.toISOString(),
  };
}
