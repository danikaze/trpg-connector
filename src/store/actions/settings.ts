import { ThunkActionCreator } from '@store';
import { loadState, StorableState } from '@utils/settings';
import { AppAction } from '.';

export type SettingsAction = LoadSettingsAction;

export type LoadSettingsAction = AppAction<'SETTINGS_LOAD', StorableState>;

export const loadSettings: ThunkActionCreator<LoadSettingsAction> = () => async (
  dispatch
) => {
  const state = await loadState();

  dispatch({
    type: 'SETTINGS_LOAD',
    payload: state,
  });
};
