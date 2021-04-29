import { CharTrackState } from './char-track';

export type StateState = 'init' | 'loading' | 'ready';

export interface State {
  state: StateState;
  charTrack: CharTrackState;
}
