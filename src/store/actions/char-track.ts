import { ActionCreator, ThunkActionCreator } from '@store';
import { TrackState } from '@store/model/char-track';
import { isCharTrackPaused } from '@store/model/char-track/selectors';
import {
  pauseTrackingStats,
  removeStatsTracker,
  resumeTrackingStats,
  startTrackingStats,
} from '@utils/stat-tracker';
import { AppAction } from './';

export type CharTrackAction =
  | CharTrackAddKeyAction
  | CharTrackRemoveKeyAction
  | CharTrackToggleAction
  | CharTrackUpdateStateAction;

export type CharTrackAddKeyAction = AppAction<
  'CHAR_TRACK_ADD_KEY',
  {
    charId: string;
    apiKey: string;
  }
>;

export type CharTrackRemoveKeyAction = AppAction<
  'CHAR_TRACK_REMOVE_KEY',
  {
    charId: string;
  }
>;

export type CharTrackToggleAction = AppAction<'CHAR_TRACK_TOGGLE'>;

export type CharTrackUpdateStateAction = AppAction<
  'CHAR_TRACK_UPDATE_STATE',
  {
    charId: string;
    state: TrackState;
  }
>;

export const addCharTrackKey: ActionCreator<CharTrackAddKeyAction> = (
  charId: string,
  apiKey: string
) => {
  startTrackingStats(charId, apiKey);

  return {
    type: 'CHAR_TRACK_ADD_KEY',
    payload: {
      charId,
      apiKey,
    },
  };
};

export const removeCharTrackKey: ActionCreator<CharTrackRemoveKeyAction> = (
  charId: string
) => {
  removeStatsTracker(charId);

  return {
    type: 'CHAR_TRACK_REMOVE_KEY',
    payload: {
      charId,
    },
  };
};

export const toggleCharTrack: ThunkActionCreator<CharTrackToggleAction> = () => (
  dispatch,
  getState
) => {
  if (isCharTrackPaused(getState())) {
    resumeTrackingStats();
  } else {
    pauseTrackingStats();
  }

  dispatch({
    type: 'CHAR_TRACK_TOGGLE',
  });
};

export const updateCharTrackState: ActionCreator<CharTrackUpdateStateAction> = (
  charId: string,
  state: TrackState
) => ({
  type: 'CHAR_TRACK_UPDATE_STATE',
  payload: {
    charId,
    state,
  },
});
