import { Reducer } from 'redux';
import { Action } from '@store/actions';
import { CharTrackState } from '@store/model/char-track';

const defaultState: CharTrackState = {
  paused: false,
  char: {},
};

export const charTrackReducer: Reducer<CharTrackState, Action> = (
  state = defaultState,
  action
) => {
  if (action.type === 'CHAR_TRACK_TOGGLE') {
    return {
      ...state,
      paused: !state.paused,
    };
  }

  if (action.type === 'CHAR_TRACK_ADD_KEY') {
    const { apiKey, charId } = action.payload;

    return {
      ...state,
      char: {
        ...state.char,
        [charId]: {
          ...state.char[charId],
          apiKey,
          state: 'set',
        },
      },
    };
  }

  if (action.type === 'CHAR_TRACK_REMOVE_KEY') {
    const newState = {
      ...state,
      char: {
        ...state.char,
      },
    };

    delete newState.char[action.payload.charId];
    return newState;
  }

  if (action.type === 'CHAR_TRACK_UPDATE_STATE') {
    const { charId } = action.payload;

    return {
      ...state,
      char: {
        ...state.char,
        [charId]: {
          ...state.char[charId],
          state: action.payload.state,
        },
      },
    };
  }

  return state;
};
