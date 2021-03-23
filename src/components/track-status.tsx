import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@utils/styles';
import { msgLog } from '@utils/logging';
import { createTrackingStats } from '@utils/stat-tracker';
import { isUuidValid } from '@utils/is-uuid-valid';
import {
  isCharTrackPaused,
  selectCharTrack,
} from '@store/model/char-track/selectors';
import { PopOver } from '@components/ui/pop-over';
import {
  addCharTrackKey,
  removeCharTrackKey,
  toggleCharTrack,
} from '@store/actions/char-track';

export interface Props {
  characterId: string;
}

interface State {
  showDetails: boolean;
  showErrorKey: boolean;
}

type Styles = ReturnType<typeof useStyles>;

const useStyles = makeStyles(() => ({
  root: {
    position: 'absolute',
    top: 18,
    right: 70,
    width: 8,
    height: 8,
    borderRadius: 5,
    cursor: 'pointer',
  },
  unset: {
    background: '#969696',
    border: '1px solid #585858',
  },
  set: {
    background: '#5589ff',
    border: '1px solid #0026b1',
  },
  sending: {
    background: '#5589ff',
    border: '1px solid #0026b1',
  },
  sync: {
    background: '#00bf17',
    border: '1px solid #026f00',
  },
  paused: {
    background: '#ffd951',
    border: '1px solid #f39d00',
  },
  error: {
    background: '#ff3c3c',
    border: '1px solid #6f0000',
  },
  currentKey: {
    borderTop: '1px solid #ddd',
    marginTop: 10,
    paddingTop: 10,
  },
  popOver: {
    maxWidth: 400,
  },
  errorInput: {
    color: '#b10000',
    border: '1px solid #b10000',
  },
}));

function useTrackStatus(characterId: string) {
  const API_KEY_SHOW_CHARS = 4;
  const charState = useSelector(selectCharTrack(characterId));
  const isTrackingPaused =
    useSelector(isCharTrackPaused) || charState?.state === 'paused';
  const apiKey =
    charState &&
    charState.apiKey &&
    `${charState.apiKey.substr(
      0,
      API_KEY_SHOW_CHARS
    )}...${charState.apiKey.substr(-API_KEY_SHOW_CHARS, API_KEY_SHOW_CHARS)}`;
  const stateRef = useRef<HTMLDivElement>(null);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    msgLog(
      `Injecting UI for character tracking with Character ID ${characterId}`
    );
    const tracker = createTrackingStats(characterId);
    if (!isTrackingPaused) {
      tracker.start(charState && charState.apiKey);
    }
  }, [characterId]);

  const [state, setState] = useState<State>({
    showDetails: false,
    showErrorKey: false,
  });

  const isWrongKey = (key: string) => {
    return !key || !isUuidValid(key);
  };

  const toggleDetails = () =>
    setState((state) => ({
      ...state,
      showDetails: !state.showDetails,
    }));

  const saveKey = () => {
    const key = keyInputRef.current!.value;
    if (!key || isWrongKey(key)) {
      return;
    }
    dispatch(addCharTrackKey(characterId, key));
  };

  const removeKey = () => {
    const doIt = confirm(
      'Remove this tracking key? (It can be added again if needed)'
    );
    if (!doIt) return;
    dispatch(removeCharTrackKey(characterId));
  };

  const toggleTracking = () => {
    dispatch(toggleCharTrack());
  };

  const onKeyInputChange = () => {
    const key = keyInputRef.current!.value.trim();
    const showErrorKey = isWrongKey(key);
    setState((state) => {
      if (state.showErrorKey === showErrorKey) return state;
      return {
        ...state,
        showErrorKey,
      };
    });
  };

  return {
    apiKey,
    stateRef,
    keyInputRef,
    toggleDetails,
    saveKey,
    removeKey,
    toggleTracking,
    onKeyInputChange,
    isTrackingPaused,
    showDetails: state.showDetails,
    state: charState ? charState.state : 'unset',
    showErrorKey: state.showErrorKey,
  };
}

export const TrackStatus: FunctionComponent<Props> = ({ characterId }) => {
  const styles = useStyles();
  const hookData = useTrackStatus(characterId);
  const { stateRef, toggleDetails, showDetails, state } = hookData;

  const classes = clsx(styles.root, styles[state]);

  const details = showDetails && (
    <PopOver
      relativeTo={stateRef.current!}
      arrow="top-right"
      onClose={toggleDetails}
      className={styles.popOver}
    >
      {getDetailContents(styles, hookData)}
    </PopOver>
  );

  return (
    <>
      <div className={classes} ref={stateRef} onClick={toggleDetails} />
      {details}
    </>
  );
};

function getDetailContents(
  styles: Styles,
  {
    showErrorKey,
    apiKey,
    state,
    keyInputRef,
    isTrackingPaused,
    saveKey,
    removeKey,
    toggleTracking,
    onKeyInputChange,
  }: ReturnType<typeof useTrackStatus>
) {
  if (state === 'unset') {
    const inputClass = clsx(showErrorKey && styles.errorInput);
    return (
      <>
        <div>This character is not configured to be tracked.</div>
        <div>Enter a valid key to start tracking it:</div>
        <input
          autoFocus={true}
          key="key-input"
          ref={keyInputRef}
          className={inputClass}
          onChange={onKeyInputChange}
        />{' '}
        <button className="btn" onClick={saveKey} disabled={showErrorKey}>
          Save
        </button>
      </>
    );
  }

  const currentKey = (
    <div className={styles.currentKey}>
      <strong>Key:</strong> <code>{apiKey}</code>{' '}
      <button className="btn" onClick={removeKey}>
        Remove
      </button>
    </div>
  );

  if (state === 'error') {
    return (
      <>
        <div>Last sync attempt for this character resulted in an error.</div>
        <div>
          If this doesn't get fixed eventually, check if the provided key is
          correct.
        </div>
        {currentKey}
      </>
    );
  }

  const toggleTrackingText = isTrackingPaused
    ? 'Resume tracking'
    : 'Pause tracking';
  const toggleTrackingButton = (
    <button className="btn" onClick={toggleTracking}>
      {toggleTrackingText}
    </button>
  );

  if (isTrackingPaused) {
    return (
      <>
        <div>Tracking for this character is paused {toggleTrackingButton}</div>
        {currentKey}
      </>
    );
  }

  if (state === 'sending') {
    return (
      <>
        <div>
          Data sync in progress...
          {toggleTrackingButton}
        </div>
        {currentKey}
      </>
    );
  }

  // sync | set
  return (
    <>
      <div>
        Currently tracking this character ^^
        {toggleTrackingButton}
      </div>
      {currentKey}
    </>
  );
}
