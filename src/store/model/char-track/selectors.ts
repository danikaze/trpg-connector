import { State } from '..';

export const selectCharTrack = (charId: string) => (state: State) =>
  state.charTrack.char[charId];

export const isCharTrackPaused = (state: State) => state.charTrack.paused;
