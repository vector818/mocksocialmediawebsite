// Main VU scenario: simulates a full user session through a social media feed.
//
// Each virtual user:
// 1. Logs in (creates a new User in the database)
// 2. Finds FACEBOOK/TWITTER pages in the template flow
// 3. Loads feed metadata (post IDs, authors)
// 4. Scrolls through posts in batches of 5
// 5. Loads media (images, profile pictures)
// 6. Randomly likes ~30% of posts
// 7. Occasionally unlikes a previously liked post
// 8. Sends tracking events on ~50% of posts
// 9. Marks the page as finished

import { login, findSocialPages } from '../helpers/auth.js';
import { loadFeedMetadata, loadPostBatch } from '../helpers/feed.js';
import { likePost, unlikePost, trackPost, finishPage } from '../helpers/actions.js';
import { fetchMedia, extractMediaIds } from '../helpers/media.js';
import { thinkTime, shouldDo, randomPick } from '../helpers/timing.js';
import {
  LIKE_PROBABILITY,
  UNLIKE_PROBABILITY,
  TRACKING_PROBABILITY,
  MIN_THINK_TIME_MS,
  MAX_THINK_TIME_MS,
  MIN_SCROLL_PAUSE_MS,
  MAX_SCROLL_PAUSE_MS,
} from '../config/env.js';

export default function socialFeedScenario() {
  // --- Step 1: Login ---
  const { token, flow, templateId } = login();
  if (!token || !flow) {
    console.error('Login failed — aborting VU.');
    return;
  }

  thinkTime(1000, 2000);

  // --- Step 2: Find social media pages in the flow ---
  const socialPages = findSocialPages(flow);
  if (socialPages.length === 0) {
    console.warn('No FACEBOOK/TWITTER pages in flow — aborting VU.');
    return;
  }

  // --- Step 3: Process each social page ---
  for (const page of socialPages) {
    const { postIds } = loadFeedMetadata(token, templateId, page);

    if (postIds.length === 0) {
      finishPage(token, page._id);
      continue;
    }

    thinkTime(MIN_THINK_TIME_MS, MAX_THINK_TIME_MS);

    // --- Step 4: Scroll through posts in batches ---
    let batchIndex = 0;
    let hasMore = true;
    const likedActions = []; // { actionId, postId } for potential unlikes

    while (hasMore) {
      const { postDetails, hasMore: more } = loadPostBatch(token, postIds, batchIndex);
      hasMore = more;
      batchIndex++;

      if (postDetails.length === 0) break;

      // --- Step 5: Load media for this batch ---
      const mediaIds = extractMediaIds(postDetails);
      for (const mediaId of mediaIds) {
        fetchMedia(mediaId);
      }

      // Simulate reading the batch of posts
      thinkTime(MIN_SCROLL_PAUSE_MS, MAX_SCROLL_PAUSE_MS);

      // --- Step 6: Interact with posts ---
      for (const post of postDetails) {
        // Skip reply/comment posts — only interact with top-level posts
        if (post.isReplyTo !== null && post.isReplyTo !== undefined) continue;

        const postId = post._id;

        // Random like
        if (shouldDo(LIKE_PROBABILITY)) {
          const actionId = likePost(token, postId);
          if (actionId) {
            likedActions.push({ actionId, postId });
          }
          thinkTime(500, 1500);
        }

        // Random tracking event
        if (shouldDo(TRACKING_PROBABILITY)) {
          const trackActions = ['LINKCLICK', 'SEEPHOTO', 'SEEVIDEO', 'SEELINK'];
          trackPost(token, randomPick(trackActions), postId);
        }
      }

      // Brief pause before loading next batch (scroll animation)
      if (hasMore) {
        thinkTime(1000, 3000);
      }
    }

    // --- Step 7: Occasionally unlike a previously liked post ---
    if (likedActions.length > 0 && shouldDo(UNLIKE_PROBABILITY)) {
      const toUnlike = randomPick(likedActions);
      unlikePost(token, toUnlike.actionId);
      thinkTime(500, 1000);
    }

    // --- Step 8: Finish the page ---
    thinkTime(1000, 2000);
    finishPage(token, page._id);
  }
}
