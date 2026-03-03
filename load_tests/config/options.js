// k6 test profiles: smoke, load, stress
// Each exports an options object with scenarios and thresholds.

// Per-endpoint thresholds shared across profiles
const baseThresholds = {
  'http_req_duration{name:login}': ['p(95)<2000'],
  'http_req_duration{name:set_participant_id}': ['p(95)<1000'],
  'http_req_duration{name:load_feed_metadata}': ['p(95)<3000'],
  'http_req_duration{name:load_post_batch}': ['p(95)<3000'],
  'http_req_duration{name:like_post}': ['p(95)<2000'],
  'http_req_duration{name:unlike_post}': ['p(95)<2000'],
  'http_req_duration{name:post_tracking}': ['p(95)<1000'],
  'http_req_duration{name:finish_page}': ['p(95)<2000'],
};

// Smoke test: 2 VUs, 1 iteration each. Validates that the script works.
export const smokeOptions = {
  scenarios: {
    smoke: {
      executor: 'per-vu-iterations',
      vus: 2,
      iterations: 1,
      maxDuration: '3m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<3000'],
    'http_req_duration{name:load_media}': ['p(95)<5000'],
    ...baseThresholds,
  },
};

// Light load test: ramp to 50 VUs, sustain for 5 minutes.
export const loadEasyOptions = {
  scenarios: {
    load_easy: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
    'http_req_duration{name:load_media}': ['p(95)<8000'],
    ...baseThresholds,
  },
};

// Load test: ramp to 100 VUs, sustain for 5 minutes.
export const loadOptions = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<5000'],
    'http_req_duration{name:load_media}': ['p(95)<8000'],
    ...baseThresholds,
  },
};

// Stress test: ramp to 300 VUs to find the breaking point.
export const stressOptions = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },
        { duration: '3m', target: 200 },
        { duration: '5m', target: 300 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<10000'],
    'http_req_duration{name:load_media}': ['p(95)<15000'],
    ...baseThresholds,
  },
};
