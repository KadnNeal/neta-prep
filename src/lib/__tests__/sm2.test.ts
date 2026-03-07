import { describe, it, expect } from "vitest";
import { calculateSM2 } from "../sm2";

// Fixed date for deterministic tests
const TODAY = new Date("2025-06-15");

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

describe("calculateSM2", () => {
  // ─── Quality validation ────────────────────────────────────────────

  it("throws on quality < 0", () => {
    expect(() =>
      calculateSM2(
        { quality: -1, easeFactor: 2.5, interval: 1, repetitions: 0 },
        TODAY
      )
    ).toThrow("Invalid quality score");
  });

  it("throws on quality > 5", () => {
    expect(() =>
      calculateSM2(
        { quality: 6, easeFactor: 2.5, interval: 1, repetitions: 0 },
        TODAY
      )
    ).toThrow("Invalid quality score");
  });

  it("throws on non-integer quality", () => {
    expect(() =>
      calculateSM2(
        { quality: 3.5, easeFactor: 2.5, interval: 1, repetitions: 0 },
        TODAY
      )
    ).toThrow("Invalid quality score");
  });

  // ─── Failed recall (quality < 3) ──────────────────────────────────

  it("resets repetitions and interval on quality 0 (blackout)", () => {
    const result = calculateSM2(
      { quality: 0, easeFactor: 2.5, interval: 10, repetitions: 5 },
      TODAY
    );
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.nextReviewDate).toBe(addDays(TODAY, 1));
  });

  it("resets on quality 1", () => {
    const result = calculateSM2(
      { quality: 1, easeFactor: 2.5, interval: 30, repetitions: 8 },
      TODAY
    );
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  it("resets on quality 2", () => {
    const result = calculateSM2(
      { quality: 2, easeFactor: 2.5, interval: 60, repetitions: 10 },
      TODAY
    );
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  // ─── Passed recall (quality >= 3) ─────────────────────────────────

  it("sets interval=1 on first successful recall (rep 0 → 1)", () => {
    const result = calculateSM2(
      { quality: 4, easeFactor: 2.5, interval: 1, repetitions: 0 },
      TODAY
    );
    expect(result.interval).toBe(1);
    expect(result.repetitions).toBe(1);
    expect(result.nextReviewDate).toBe(addDays(TODAY, 1));
  });

  it("sets interval=6 on second successful recall (rep 1 → 2)", () => {
    const result = calculateSM2(
      { quality: 4, easeFactor: 2.5, interval: 1, repetitions: 1 },
      TODAY
    );
    expect(result.interval).toBe(6);
    expect(result.repetitions).toBe(2);
    expect(result.nextReviewDate).toBe(addDays(TODAY, 6));
  });

  it("scales interval by ease factor on subsequent recalls (rep >= 2)", () => {
    const result = calculateSM2(
      { quality: 4, easeFactor: 2.5, interval: 6, repetitions: 2 },
      TODAY
    );
    // 6 * 2.5 = 15
    expect(result.interval).toBe(15);
    expect(result.repetitions).toBe(3);
    expect(result.nextReviewDate).toBe(addDays(TODAY, 15));
  });

  it("rounds interval to nearest integer", () => {
    const result = calculateSM2(
      { quality: 3, easeFactor: 1.8, interval: 7, repetitions: 3 },
      TODAY
    );
    // 7 * 1.8 = 12.6 → rounds to 13
    expect(result.interval).toBe(13);
  });

  // ─── Ease factor calculation ──────────────────────────────────────

  it("increases ease factor on quality 5 (perfect)", () => {
    const result = calculateSM2(
      { quality: 5, easeFactor: 2.5, interval: 1, repetitions: 0 },
      TODAY
    );
    // EF' = 2.5 + (0.1 - 0 * (0.08 + 0 * 0.02)) = 2.5 + 0.1 = 2.6
    expect(result.easeFactor).toBe(2.6);
  });

  it("keeps ease factor mostly unchanged on quality 4", () => {
    const result = calculateSM2(
      { quality: 4, easeFactor: 2.5, interval: 1, repetitions: 0 },
      TODAY
    );
    // EF' = 2.5 + (0.1 - 1*(0.08 + 1*0.02)) = 2.5 + (0.1 - 0.10) = 2.5
    expect(result.easeFactor).toBe(2.5);
  });

  it("decreases ease factor on quality 3", () => {
    const result = calculateSM2(
      { quality: 3, easeFactor: 2.5, interval: 1, repetitions: 0 },
      TODAY
    );
    // EF' = 2.5 + (0.1 - 2*(0.08 + 2*0.02)) = 2.5 + (0.1 - 0.24) = 2.36
    expect(result.easeFactor).toBe(2.36);
  });

  it("decreases ease factor on quality 0 (still applies formula)", () => {
    const result = calculateSM2(
      { quality: 0, easeFactor: 2.5, interval: 1, repetitions: 0 },
      TODAY
    );
    // EF' = 2.5 + (0.1 - 5*(0.08 + 5*0.02)) = 2.5 + (0.1 - 0.9) = 1.7
    expect(result.easeFactor).toBe(1.7);
  });

  // ─── Ease factor floor at 1.3 ────────────────────────────────────

  it("clamps ease factor to 1.3 minimum", () => {
    const result = calculateSM2(
      { quality: 0, easeFactor: 1.3, interval: 1, repetitions: 0 },
      TODAY
    );
    // EF' = 1.3 + (0.1 - 0.9) = 0.5 → clamped to 1.3
    expect(result.easeFactor).toBe(1.3);
  });

  it("clamps ease factor just above floor", () => {
    const result = calculateSM2(
      { quality: 1, easeFactor: 1.3, interval: 1, repetitions: 0 },
      TODAY
    );
    // EF' = 1.3 + (0.1 - 4*(0.08 + 4*0.02)) = 1.3 + (0.1 - 0.64) = 0.76 → 1.3
    expect(result.easeFactor).toBe(1.3);
  });

  // ─── Progression simulation ───────────────────────────────────────

  it("progresses correctly through multiple perfect reviews", () => {
    let ef = 2.5;
    let interval = 1;
    let reps = 0;

    // Review 1: quality 5
    let r = calculateSM2(
      { quality: 5, easeFactor: ef, interval, repetitions: reps },
      TODAY
    );
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(1);
    ef = r.easeFactor;
    interval = r.interval;
    reps = r.repetitions;

    // Review 2: quality 5
    r = calculateSM2(
      { quality: 5, easeFactor: ef, interval, repetitions: reps },
      TODAY
    );
    expect(r.interval).toBe(6);
    expect(r.repetitions).toBe(2);
    ef = r.easeFactor;
    interval = r.interval;
    reps = r.repetitions;

    // Review 3: quality 5 — interval = round(6 * 2.7) = 16
    r = calculateSM2(
      { quality: 5, easeFactor: ef, interval, repetitions: reps },
      TODAY
    );
    expect(r.interval).toBe(16);
    expect(r.repetitions).toBe(3);
  });

  it("resets progress on a failure mid-sequence", () => {
    // Build up to rep 3
    let ef = 2.5;
    let interval = 1;
    let reps = 0;

    // 3 perfect reviews
    for (let i = 0; i < 3; i++) {
      const r = calculateSM2(
        { quality: 5, easeFactor: ef, interval, repetitions: reps },
        TODAY
      );
      ef = r.easeFactor;
      interval = r.interval;
      reps = r.repetitions;
    }

    expect(reps).toBe(3);
    expect(interval).toBe(16);

    // Now fail
    const fail = calculateSM2(
      { quality: 2, easeFactor: ef, interval, repetitions: reps },
      TODAY
    );
    expect(fail.repetitions).toBe(0);
    expect(fail.interval).toBe(1);
    // Ease factor decreases but stays above floor
    expect(fail.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  // ─── Next review date ────────────────────────────────────────────

  it("computes next review date correctly", () => {
    const result = calculateSM2(
      { quality: 5, easeFactor: 2.5, interval: 6, repetitions: 2 },
      new Date("2025-01-01")
    );
    // interval = round(6 * 2.5) = 15
    expect(result.nextReviewDate).toBe("2025-01-16");
  });

  it("handles month boundary correctly", () => {
    const result = calculateSM2(
      { quality: 5, easeFactor: 2.5, interval: 6, repetitions: 2 },
      new Date("2025-01-25")
    );
    // 15 days from Jan 25 = Feb 9
    expect(result.nextReviewDate).toBe("2025-02-09");
  });

  it("handles year boundary correctly", () => {
    const result = calculateSM2(
      { quality: 4, easeFactor: 2.5, interval: 1, repetitions: 1 },
      new Date("2025-12-28")
    );
    // 6 days from Dec 28 = Jan 3
    expect(result.nextReviewDate).toBe("2026-01-03");
  });
});
