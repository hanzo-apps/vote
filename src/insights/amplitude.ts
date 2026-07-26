import * as amplitude from '@amplitude/analytics-browser';

export const initAmplitude = () => {
  const amplitudeApiKey = import.meta.env.VITE_APP_AMPLITUDE_API_KEY;

  // Guard on absent-or-empty, not `=== ''`. VITE_APP_AMPLITUDE_API_KEY is opt-in
  // (commented out in .env, never injected by the build) exactly like the Hotjar
  // pair, so Vite inlines the read as `undefined` — which `=== ''` never matches.
  // The guard was then statically false and dead-code-eliminated, leaving the
  // shipped bundle calling `amplitude.init(void 0, …)`; the SDK came up without an
  // API key and rejected every track() for the life of the page. Falsy covers both
  // shapes, so an unprovisioned key now disables Amplitude instead of half-arming
  // it, and Vite drops the init entirely.
  if (!amplitudeApiKey) {
    return;
  }

  amplitude.init(amplitudeApiKey, {
    defaultTracking: true,
  });
};
