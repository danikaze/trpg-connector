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
  return action.type === 'SETTINGS_LOAD' ? action.payload : (state as State);
};

const combinedReducers = combineReducers<State, Action>({
  charTrack: charTrackReducer,
});
