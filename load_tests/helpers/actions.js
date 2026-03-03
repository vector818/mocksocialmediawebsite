import { group, check } from 'k6';
import { BASE_URL } from '../config/env.js';
import { authHeaders, checkedPost, checkedDelete } from './http-utils.js';

// Like a post. Returns the action ID (for potential unlike) or null.
export function likePost(token, userPostId) {
  let actionId = null;

  group('Like Post', () => {
    const res = checkedPost(
      `${BASE_URL}/user/facebook/action`,
      {
        actionObj: {
          action: 'LIKE',
          comment: null,
          userPostId: userPostId,
        },
      },
      authHeaders(token),
      'like_post'
    );

    if (res.status !== 200) return;

    const body = res.json();
    check(body, {
      'like returns action ID': (b) => !!b._id,
    });
    actionId = body._id || null;
  });

  return actionId;
}

// Unlike a post by deleting the action.
export function unlikePost(token, actionId) {
  group('Unlike Post', () => {
    checkedDelete(
      `${BASE_URL}/user/facebook/action/${actionId}`,
      authHeaders(token),
      'unlike_post'
    );
  });
}

// Send a post-level tracking event.
// Valid actions: LINKCLICK, SEEWHY, SHAREANYWAY, SEEPHOTO, SEEVIDEO, SEELINK
export function trackPost(token, action, userPostId) {
  group('Track Post', () => {
    checkedPost(
      `${BASE_URL}/user/tracking/post`,
      {
        trackObj: {
          action: action,
          userPostId: userPostId,
        },
      },
      authHeaders(token),
      'post_tracking'
    );
  });
}

// Mark a page as finished (page-level tracking).
export function finishPage(token, pageId) {
  group('Finish Page', () => {
    checkedPost(
      `${BASE_URL}/user/tracking/global`,
      {
        pageId: pageId,
        finishedAt: new Date().toISOString(),
      },
      authHeaders(token),
      'finish_page'
    );
  });
}
