export type TrackState =
  | 'unset'
  | 'set'
  | 'sending'
  | 'sync'
  | 'error'
  | 'paused';

export type CharTrackState = {
  paused: boolean;
  char: Record<string, CharTrack | undefined>;
};

export interface CharTrack {
  state: TrackState;
  apiKey?: string;
}
