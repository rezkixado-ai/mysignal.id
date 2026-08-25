import { getStore } from '@netlify/blobs';

export default async (request) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key) return new Response('Missing key', { status: 400 });

  const store = getStore('mysignal-media');
  const result = await store.getWithMetadata(key, { type: 'stream' });
  if (!result) return new Response('Not found', { status: 404 });

  const contentType = result.metadata?.contentType || 'application/octet-stream';

  return new Response(result.data, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Accept-Ranges': 'bytes'
    }
  });
};

export const config = { path: '/api/media-serve' };
