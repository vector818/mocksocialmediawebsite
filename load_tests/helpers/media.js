import http from 'k6/http';
import { group, check } from 'k6';
import { BASE_URL, MEDIA_FETCH_ENABLED } from '../config/env.js';

// Fetch a media BLOB (image/video). No auth required.
export function fetchMedia(mediaId) {
  if (!MEDIA_FETCH_ENABLED || !mediaId) return;

  group('Fetch Media', () => {
    const res = http.get(`${BASE_URL}/user/facebook/media/${mediaId}`, {
      tags: { name: 'load_media' },
      responseType: 'binary',
    });

    check(res, {
      'media status 200': (r) => r.status === 200,
      'media has content-type': (r) => !!r.headers['Content-Type'],
    });
  });
}

// Extract all media IDs from a batch of post details.
// Includes post media (images/videos) and author profile pictures.
export function extractMediaIds(postDetails) {
  const mediaIds = [];
  for (const post of postDetails) {
    if (post.attachedMedia && post.attachedMedia.length > 0) {
      for (const media of post.attachedMedia) {
        if (media._id) mediaIds.push(media._id);
      }
    }
    if (post.attachedAuthorPicture && post.attachedAuthorPicture._id) {
      mediaIds.push(post.attachedAuthorPicture._id);
    }
  }
  return mediaIds;
}
