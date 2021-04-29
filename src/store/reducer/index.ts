import { combineReducers, Reducer } from 'redux';
import { Action } from '../actions';
import { State } from '../model';
import { charTrackReducer } from './char-track';

export const reducer: Reducer<State, Action> = (state, action) => {
  const newState = settingsReducer(state, action);
  if (state !== newState) return newState;
  return combinedReducers(state, action);
};

const settingsReducer: Reducer<State, Action> = (state, action) => {
  const s = state as State;

  if (action.type === 'SETTINGS_LOAD_START') {
    return {
      ...s,
      state: 'loading',
    };
  }

  if (action.type === 'SETTINGS_LOAD') {
    return {
      ...s,
      ...action.payload,
      state: 'ready',
    } as State;
  }

  return s;
};

const combinedReducers = combineReducers<State, Action>({
  state: (s) => s || 'init',
  charTrack: charTrackReducer,
});
