/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Determines the next review interval for a question based on the user's
 * self-assessed quality of recall (0–5).
 *
 * Quality score mapping:
 *   0 = "Complete blackout"
 *   1 = "Wrong, familiar"
 *   2 = "Wrong, easy to recall"
 *   3 = "Correct, hard"
 *   4 = "Correct, some hesitation"
 *   5 = "Perfect recall"
 */

export interface SM2Input {
  quality: number;       // 0–5
  easeFactor: number;    // current ease factor (>= 1.3)
  interval: number;      // current interval in days
  repetitions: number;   // current successful repetition count
}

export interface SM2Output {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string; // ISO date string (YYYY-MM-DD)
}

export function calculateSM2(input: SM2Input, today?: Date): SM2Output {
  const { quality, easeFactor, interval, repetitions } = input;

  if (quality < 0 || quality > 5 || !Number.isInteger(quality)) {
    throw new Error(`Invalid quality score: ${quality}. Must be an integer 0–5.`);
  }

  let newEaseFactor: number;
  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Failed — reset to beginning
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Passed — advance interval
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  }

  // Ease factor adjustment (applied regardless of pass/fail)
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Floor at 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Calculate next review date
  const reviewDate = today ? new Date(today) : new Date();
  reviewDate.setDate(reviewDate.getDate() + newInterval);
  const nextReviewDate = reviewDate.toISOString().split("T")[0];

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100, // 2 decimal places
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  };
}
