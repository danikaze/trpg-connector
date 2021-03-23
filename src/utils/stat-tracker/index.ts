import { CharStatTracker } from './char-stat-tracker';

const trackers: Record<string, CharStatTracker> = {};

export function createTrackingStats(charId: string) {
  if (!trackers[charId]) {
    trackers[charId] = new CharStatTracker(charId);
  }
  return trackers[charId];
}

export function removeStatsTracker(charId: string) {
  stopTrackingStats(charId);
  delete trackers[charId];
}

export async function startTrackingStats(charId: string, apiKey: string) {
  createTrackingStats(charId);
  trackers[charId].start(apiKey);
}

export function stopTrackingStats(charId: string) {
  if (!trackers[charId]) return;
  trackers[charId].stop();
}

export function pauseTrackingStats() {
  Object.values(trackers).forEach((tracker) => {
    tracker.stop();
  });
}

export function resumeTrackingStats() {
  Object.values(trackers).forEach((tracker) => {
    tracker.start();
  });
}
