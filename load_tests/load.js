// Load test: ramp from 0 to 100 VUs over 4 minutes, sustain for 5 minutes.
// Tests whether the server handles the target concurrency level.
//
// Usage:
//   k6 run -e BASE_URL=https://your-vps.com/api -e TEMPLATE_CODE=123456 load_tests/load.js
//
// Disable media fetching to isolate backend performance:
//   k6 run -e BASE_URL=https://your-vps.com/api -e TEMPLATE_CODE=123456 -e MEDIA_FETCH_ENABLED=false load_tests/load.js

import { loadOptions } from './config/options.js';
import socialFeedScenario from './scenarios/social-feed.js';

export const options = loadOptions;
export default socialFeedScenario;
