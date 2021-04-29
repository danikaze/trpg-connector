import { CharTrackAction } from './char-track';
import { SettingsAction } from './settings';

export type AppAction<
  T extends string,
  P extends {} | undefined = undefined,
  M extends {} | undefined = undefined
> = {
  type: T;
  error?: boolean;
} & (P extends undefined ? { payload?: P } : { payload: P }) &
  (M extends undefined ? { meta?: M } : { meta: M });

export type Action = CharTrackAction | SettingsAction;
