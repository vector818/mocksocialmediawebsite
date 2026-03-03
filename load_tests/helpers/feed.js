import { group, check } from 'k6';
import { BASE_URL, POST_BATCH_SIZE, LANGUAGE } from '../config/env.js';
import { authHeaders, checkedGet, checkedPost } from './http-utils.js';

// Load feed metadata: post IDs, authors, translations.
// page = { _id, type, pageDataOrder } from the flow array.
export function loadFeedMetadata(token, templateId, page) {
  let postIds = [];
  let authors = [];

  group('Load Feed Metadata', () => {
    const platform = page.type; // 'FACEBOOK' or 'TWITTER'
    const pageId = page._id;
    const order = page.pageDataOrder || 'ASC';

    const url = `${BASE_URL}/user/facebook/${templateId}/${platform}/${LANGUAGE}/${pageId}/${order}`;
    const res = checkedGet(url, authHeaders(token), 'load_feed_metadata');

    if (res.status !== 200) return;

    const body = res.json();
    check(body, {
      'feed has postIds array': (b) => Array.isArray(b.postIds),
      'feed has totalPosts': (b) => typeof b.totalPosts === 'number',
    });

    postIds = body.postIds || [];
    authors = body.authors || [];
  });

  return { postIds, authors };
}

// Load a batch of posts by index. Returns { postDetails, hasMore }.
export function loadPostBatch(token, postIds, batchIndex) {
  const startIdx = batchIndex * POST_BATCH_SIZE;
  const batchIds = postIds.slice(startIdx, startIdx + POST_BATCH_SIZE);
  let postDetails = [];

  if (batchIds.length === 0) {
    return { postDetails, hasMore: false };
  }

  group(`Load Post Batch ${batchIndex}`, () => {
    const res = checkedPost(
      `${BASE_URL}/user/facebook/posts`,
      { postIds: batchIds },
      authHeaders(token),
      'load_post_batch'
    );

    if (res.status !== 200) return;

    const body = res.json();
    check(body, {
      'batch has postDetails': (b) => Array.isArray(b.postDetails),
    });

    postDetails = body.postDetails || [];
  });

  const hasMore = startIdx + POST_BATCH_SIZE < postIds.length;
  return { postDetails, hasMore };
}
