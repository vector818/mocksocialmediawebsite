// Environment variable configuration with defaults.
// Override any value with: k6 run -e VAR_NAME=value

// Target API base URL (no trailing slash)
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api';

// Skip TLS certificate verification (for self-signed certs)
export const INSECURE_SKIP_TLS = (__ENV.INSECURE_SKIP_TLS || 'false') === 'true';

// Template code (integer) — must exist in the database
export const TEMPLATE_CODE = parseInt(__ENV.TEMPLATE_CODE || '100000', 10);

// Participant ID prefix — each VU gets a unique ID: "<prefix>-<vu_number>-<timestamp>"
export const PARTICIPANT_ID_PREFIX = __ENV.PARTICIPANT_ID_PREFIX || 'loadtest';

// Language for feed translations
export const LANGUAGE = __ENV.LANGUAGE || 'ENGLISH';

// Whether to fetch media BLOBs (the heaviest endpoint)
export const MEDIA_FETCH_ENABLED = (__ENV.MEDIA_FETCH_ENABLED || 'true') === 'true';

// Probability of liking a post (0.0 - 1.0)
export const LIKE_PROBABILITY = parseFloat(__ENV.LIKE_PROBABILITY || '0.3');

// Probability of unliking a previously liked post (0.0 - 1.0)
export const UNLIKE_PROBABILITY = parseFloat(__ENV.UNLIKE_PROBABILITY || '0.2');

// Probability of sending a tracking event per post (0.0 - 1.0)
export const TRACKING_PROBABILITY = parseFloat(__ENV.TRACKING_PROBABILITY || '0.5');

// Number of posts loaded per scroll batch (matches frontend: 5)
export const POST_BATCH_SIZE = parseInt(__ENV.POST_BATCH_SIZE || '5', 10);

// Think time range: simulates user reading between actions (ms)
export const MIN_THINK_TIME_MS = parseInt(__ENV.MIN_THINK_TIME_MS || '2000', 10);
export const MAX_THINK_TIME_MS = parseInt(__ENV.MAX_THINK_TIME_MS || '8000', 10);

// Scroll pause range: simulates user reading a batch of posts (ms)
export const MIN_SCROLL_PAUSE_MS = parseInt(__ENV.MIN_SCROLL_PAUSE_MS || '3000', 10);
export const MAX_SCROLL_PAUSE_MS = parseInt(__ENV.MAX_SCROLL_PAUSE_MS || '12000', 10);
