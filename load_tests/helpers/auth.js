import { group, check } from 'k6';
import exec from 'k6/execution';
import { BASE_URL, TEMPLATE_CODE, PARTICIPANT_ID_PREFIX } from '../config/env.js';
import { checkedPost, authHeaders } from './http-utils.js';

// Simulates clicking the full link: /:accessCode/:participantId
// 1. POST /api/user/login  — creates user, returns JWT
// 2. POST /api/user/main   — sets participantId (qualtricsId)
// Returns { token, flow, templateId } or nulls on failure.
export function login() {
  let token = null;
  let flow = null;
  let templateId = null;

  group('Login', () => {
    // Step 1: Login with access code
    const res = checkedPost(
      `${BASE_URL}/user/login`,
      { templateId: TEMPLATE_CODE },
      { headers: { 'Content-Type': 'application/json' } },
      'login'
    );

    if (res.status !== 200) return;

    const body = res.json();
    check(body, {
      'login returns accessToken': (b) => !!b.accessToken,
      'login returns flow array': (b) => Array.isArray(b.flow),
      'login returns templateId': (b) => !!b.templateId,
    });

    token = body.accessToken || null;
    flow = body.flow || null;
    templateId = body.templateId || null;

    if (!token) return;

    // Step 2: Set participant ID (like clicking the full link with participantId)
    const participantId = `${PARTICIPANT_ID_PREFIX}-vu${exec.vu.idInTest}-${Date.now()}`;
    checkedPost(
      `${BASE_URL}/user/main`,
      { userObj: { qualtricsId: participantId } },
      authHeaders(token),
      'set_participant_id'
    );
  });

  return { token, flow, templateId };
}

// Filter social media pages (FACEBOOK or TWITTER) from the flow array
export function findSocialPages(flow) {
  if (!Array.isArray(flow)) return [];
  return flow.filter(
    (page) => page.type === 'FACEBOOK' || page.type === 'TWITTER'
  );
}
