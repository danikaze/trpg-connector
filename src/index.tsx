import React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { TrackStatus } from '@components/track-status';
import { msgLog } from '@utils/logging';
import { waitUntil } from '@utils/wait-until';
import { store, ThunkDispatch } from '@store';
import { Action } from '@store/actions';
import { loadSettings } from '@store/actions/settings';

msgLog('Extension initialized');

const match = /\/editor\/character\/([^/]+)\/([^/]+)\//.exec(location.href);
if (match) {
  (store.dispatch as ThunkDispatch<Action>)(loadSettings());

  // const gameId = match[1];
  const charId = match[2];
  initCharTracking(charId);
}

async function initCharTracking(charId: string) {
  injectUi(charId);
}

async function injectUi(charId: string) {
  const parent = (await waitUntil(() =>
    document.getElementById('edit-button')
  ))!.parentElement!;
  const container = document.createElement('div');
  parent.appendChild(container);

  const app = (
    <Provider store={store}>
      <TrackStatus characterId={charId} />
    </Provider>
  );
  render(app, container);
}
