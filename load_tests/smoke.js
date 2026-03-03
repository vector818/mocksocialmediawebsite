// Smoke test: 2 VUs, 1 iteration each.
// Validates that the test script works correctly against the target.
//
// Usage:
//   k6 run -e BASE_URL=http://localhost:8080/api -e TEMPLATE_CODE=100000 load_tests/smoke.js

import { smokeOptions } from './config/options.js';
import socialFeedScenario from './scenarios/social-feed.js';

export const options = smokeOptions;
export default socialFeedScenario;
