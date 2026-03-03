// Stress test: ramp to 300 VUs to find the server's breaking point.
// Expect higher error rates — the goal is to discover limits.
//
// Usage:
//   k6 run -e BASE_URL=https://your-vps.com/api -e TEMPLATE_CODE=123456 load_tests/stress.js

import { stressOptions } from './config/options.js';
import socialFeedScenario from './scenarios/social-feed.js';

export const options = stressOptions;
export default socialFeedScenario;
