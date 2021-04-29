import { debounce } from 'throttle-debounce';
import { store } from '@store';
import { updateCharTrackState } from '@store/actions/char-track';
import { selectCharTrack } from '@store/model/char-track/selectors';
import { callApi } from '@utils/call-api';
import { getDiff } from '@utils/get-diff';
import { msgLog } from '@utils/logging';
import { waitUntil } from '@utils/wait-until';
import {
  statAlignment,
  statArmorClass,
  statCharisma,
  statClass,
  statConstitution,
  statDexterity,
  statHp,
  statIntelligence,
  statLevel,
  statMaxHp,
  statName,
  statRace,
  statStrength,
  statTempHp,
  statWisdom,
} from './elem-selectors';

export type CharacterStats = Partial<
  {
    title: string;
  } & Record<string | number, string | number>
>;

const fields: Record<
  keyof CharacterStats,
  {
    getElement: () => HTMLElement | null;
    getValue: () => string | number | undefined;
  }
> = {
  title: statName,
  9: statAlignment,
  10: statRace,
  11: statClass,
  12: statLevel,
  13: statHp,
  14: statMaxHp,
  15: statTempHp,
  16: statStrength,
  17: statDexterity,
  18: statConstitution,
  19: statIntelligence,
  20: statWisdom,
  21: statCharisma,
  22: statArmorClass,
};

const FIELD_ALIGNMENT = 6;
const FIELD_RACE = 7;
const FIELD_CLASS = 8;
const FIELD_LEVEL = 9;
const ALIGNMENTS = ['LG', 'NG', 'CG', 'LN', 'NN', 'CN', 'LE', 'NE', 'CE'];

export class CharStatTracker {
  protected static readonly STOP_AFTER_ERRORS = 3;
  protected static readonly THROTTLE_MS = 1000;
  protected static readonly API_URL =
    'http://localhost:3000/api/v1/{keyId}/note';

  protected readonly charId: string;
  protected tracking: boolean = false;
  protected apiKey: string | undefined;
  protected currentValues: CharacterStats = {};
  protected changedValues: CharacterStats = {};
  protected listeners: Record<keyof typeof fields, EventListener> = {};
  protected errors = 0;
  protected sending = false;
  protected queued = false;

  constructor(charId: string) {
    this.charId = charId;
    this.updateStats = debounce(CharStatTracker.THROTTLE_MS, this.updateStats);
  }

  protected static normalizeValues(values: CharacterStats): CharacterStats {
    if (values[FIELD_LEVEL]) {
      const MIN_LEVEL = 1;
      const MAX_LEVEL = 20;
      let level = Number(values[FIELD_LEVEL]);
      level = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));
      if (isNaN(level)) {
        delete values[FIELD_LEVEL];
      } else {
        values[FIELD_LEVEL] = level;
      }
    }

    if (values[FIELD_RACE]) {
      values[FIELD_RACE] = String(values[FIELD_RACE])
        .toLowerCase()
        .replace(/[\s]/g, '');
    }

    if (values[FIELD_CLASS]) {
      values[FIELD_CLASS] = String(values[FIELD_CLASS])
        .toLowerCase()
        .replace(/[\s-]/g, '');
    }

    if (values[FIELD_ALIGNMENT]) {
      const alignment = String(values[FIELD_ALIGNMENT]).trim();
      if (ALIGNMENTS.includes(alignment)) {
        values[FIELD_ALIGNMENT] = alignment;
      } else {
        let value: string;
        try {
          if (/^L/i.test(alignment)) {
            value = 'L';
          } else if (/^N/i.test(alignment)) {
            value = 'N';
          } else if (/^C/i.test(alignment)) {
            value = 'C';
          } else {
            throw new Error('Unknown alignment');
          }
          if (/[ -]G/i.test(alignment)) {
            value += 'G';
          } else if (/[ -]N/i.test(alignment)) {
            value = 'N';
          } else if (/[ -]E/i.test(alignment)) {
            value = 'E';
          } else {
            throw new Error('Unknown alignment');
          }
          values[FIELD_ALIGNMENT] = value;
        } catch (e) {
          delete values[FIELD_ALIGNMENT];
        }
      }
    }

    return values;
  }

  public async start(apiKey?: string) {
    const observerElement = await this.getElement();
    if (!observerElement || this.tracking) return;

    this.apiKey = apiKey || this.apiKey;
    if (!this.apiKey) return;

    msgLog(`Tracking stats for character ${this.charId}`);
    this.tracking = true;
    this.changedValues = this.getCurrentValues();
    this.updateStats();
    this.addListeners();
  }

  public stop() {
    if (!this.tracking) return;
    this.tracking = false;
    this.removeListeners();
    msgLog(`Stop tracking stats for character ${this.charId}`);
  }

  protected async getElement(): Promise<HTMLElement | undefined> {
    await waitUntil(() => statMaxHp.getElement());
    return document.body;
  }

  protected async updateStats() {
    if (!this.apiKey) return;

    const diff = getDiff(this.currentValues, this.changedValues);
    if (Object.keys(diff).length === 0) return;

    const url = CharStatTracker.API_URL.replace('{keyId}', this.apiKey);
    const { title, ...content } = {
      title: fields['title'].getValue(),
      ...diff,
    };
    const charState = selectCharTrack(this.charId)(store.getState());

    if (charState && charState.state === 'sending') {
      this.queued = true;
      return;
    }
    store.dispatch(updateCharTrackState(this.charId, 'sending'));
    this.queued = false;

    try {
      await callApi(url, 'PUT', {
        data: {
          note: {
            title,
            content: CharStatTracker.normalizeValues(content),
          },
        },
      });
      store.dispatch(updateCharTrackState(this.charId, 'sync'));
      Object.assign(this.currentValues, diff);
      this.changedValues = {};
      this.errors = 0;
    } catch (e) {
      store.dispatch(updateCharTrackState(this.charId, 'error'));
      this.errors++;
      if (this.errors > CharStatTracker.STOP_AFTER_ERRORS) {
        this.stop();
      }
    }

    if (this.queued) {
      this.updateStats();
      this.queued = false;
    }
  }

  protected getCurrentValues(): CharacterStats {
    return Object.entries(fields).reduce((values, [fieldId, stat]) => {
      const value = stat.getValue();
      if (value !== undefined) {
        values[fieldId] = value;
      }
      return values;
    }, {} as CharacterStats);
  }

  protected addListeners() {
    Object.entries(fields).forEach(([fieldId, stat]) => {
      const elem = stat.getElement();
      if (!elem) return;
      this.listeners[fieldId] = () => {
        const value = stat.getValue();
        if (value === undefined) return;
        this.changedValues[fieldId] = value;
        this.updateStats();
      };
      elem.addEventListener('change', this.listeners[fieldId]);
    });
  }

  protected removeListeners() {
    Object.entries(this.listeners).forEach(([fieldId, listener]) => {
      const elem = fields[fieldId].getElement();
      if (elem) {
        elem.removeEventListener('change', listener);
      }
      delete this.listeners[fieldId];
    });
  }
}
