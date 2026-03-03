import http from 'k6/http';
import { check } from 'k6';

// Build request params with auth header
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
  };
}

// POST with JSON body, response checks, and named tag for thresholds
export function checkedPost(url, body, params, tagName) {
  const res = http.post(url, JSON.stringify(body), {
    ...params,
    tags: { name: tagName },
  });
  check(res, {
    [`${tagName} status 200`]: (r) => r.status === 200,
  });
  return res;
}

// GET with response checks and named tag
export function checkedGet(url, params, tagName) {
  const res = http.get(url, {
    ...params,
    tags: { name: tagName },
  });
  check(res, {
    [`${tagName} status 200`]: (r) => r.status === 200,
  });
  return res;
}

// DELETE with response checks and named tag
export function checkedDelete(url, params, tagName) {
  const res = http.del(url, null, {
    ...params,
    tags: { name: tagName },
  });
  check(res, {
    [`${tagName} status 200`]: (r) => r.status === 200,
  });
  return res;
}
