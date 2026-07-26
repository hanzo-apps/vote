import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as amplitude from '@amplitude/analytics-browser';
import { initAmplitude } from '../src/insights/amplitude';

vi.mock('@amplitude/analytics-browser', () => ({ init: vi.fn() }));

const KEY = 'VITE_APP_AMPLITUDE_API_KEY';
const env = import.meta.env as unknown as Record<string, unknown>;

describe('initAmplitude', () => {
  let original: unknown;

  beforeEach(() => {
    original = env[KEY];
    vi.mocked(amplitude.init).mockClear();
  });

  afterEach(() => {
    if (original === undefined) delete env[KEY];
    else env[KEY] = original;
  });

  // The regression this file exists for: the guard was `=== ''`, which an ABSENT
  // variable never matches. VITE_APP_AMPLITUDE_API_KEY is opt-in and unprovisioned,
  // so the shipped bundle called `init(undefined, …)` and the SDK rejected every
  // event for a missing API key. Absent must be as inert as empty.
  it('stays inert when the key is absent', () => {
    delete env[KEY];
    initAmplitude();
    expect(amplitude.init).not.toHaveBeenCalled();
  });

  it('stays inert when the key is empty', () => {
    env[KEY] = '';
    initAmplitude();
    expect(amplitude.init).not.toHaveBeenCalled();
  });

  it('initializes when the key is provisioned', () => {
    env[KEY] = 'abc123realkey';
    initAmplitude();
    expect(amplitude.init).toHaveBeenCalledWith('abc123realkey', { defaultTracking: true });
  });
});
