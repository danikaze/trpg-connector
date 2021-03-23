import { Dispatch, Middleware } from 'redux';
import { State } from '@store/model';
import { msgLog, msgWarn } from '@utils/logging';
import { Action } from '@store/actions';

export type StorableState = Pick<State, 'charTrack'>;
export interface Settings extends StorableState {
  version: string;
}

const defaultSettings: Settings = {
  version: PACKAGE_VERSION,
  charTrack: {
    paused: false,
    char: {},
  },
};

export async function saveState(state: State): Promise<void> {
  const settings: Settings = {
    version: PACKAGE_VERSION,
    charTrack: state.charTrack,
  };

  return saveSettings(settings);
}

export async function loadState(): Promise<StorableState> {
  const { version, ...state } = await loadSettings();
  return state;
}

export const storeStateMiddleware: Middleware<Dispatch<Action>> = (
  storeApi
) => (next) => (action) => {
  if (action.type === 'SETTINGS_LOAD') {
    return next(action);
  }

  const oldState = storeApi.getState();
  next(action);
  const newState = storeApi.getState();
  if (oldState === newState) return;
  saveSettings(newState);
};

async function saveSettings(settings: Settings): Promise<void> {
  return new Promise<void>((resolve) => {
    const strSettings = JSON.stringify(settings);
    chrome.storage.sync.set({ settings: strSettings }, () => {
      resolve();
      msgLog('Settings stored', settings);
    });
  });
}

async function loadSettings(): Promise<Settings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['settings'], async ({ settings }) => {
      try {
        if (settings) {
          const json = JSON.parse(settings) as Settings;
          msgLog('Settings loaded', json);
          resolve(await upgradeSettings(json));
        } else {
          msgLog('No settings found, using default ones', defaultSettings);
          resolve(defaultSettings);
        }
      } catch (e) {
        msgWarn(
          'Error parsing the settings, using default ones',
          defaultSettings
        );
        resolve(defaultSettings);
      }
    });
  });
}

async function upgradeSettings(settings: Settings): Promise<Settings> {
  if (settings.version === PACKAGE_VERSION) {
    return settings;
  }
  msgLog(`Upgrading settings from ${settings.version} to ${PACKAGE_VERSION}`);

  // store update settings
  settings.version = PACKAGE_VERSION;
  await saveSettings(settings);

  return settings;
}
