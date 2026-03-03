// Light load test: ramp to 50 VUs, sustain for 5 minutes.
// Lighter variant of load.js for smaller VPS instances.
//
// Usage:
//   k6 run -e BASE_URL=https://your-vps.com/api -e TEMPLATE_CODE=123456 -e INSECURE_SKIP_TLS=true load_tests/load-easy.js

import { loadEasyOptions } from './config/options.js';
import socialFeedScenario from './scenarios/social-feed.js';

export const options = loadEasyOptions;
export default socialFeedScenario;
