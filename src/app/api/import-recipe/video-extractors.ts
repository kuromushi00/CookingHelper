import { YoutubeTranscript } from 'youtube-transcript';

export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch|shorts)|youtu\.be\/)/.test(url);
}

export function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(?:p|reel)\//.test(url);
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?.*v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function extractYouTubeContent(url: string): Promise<{
  title: string;
  description: string;
  transcript: string;
}> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) throw new Error('YouTube動画のURLを認識できませんでした');

  // Fetch title via oEmbed
  let title = '';
  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    if (oembed.ok) {
      const data = await oembed.json();
      title = data.title || '';
    }
  } catch {
    // ignore
  }

  // Fetch description from YouTube page HTML
  let description = '';
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'ja,en;q=0.5',
      },
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      // Extract description from meta tag
      const ogDesc = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]*)"/);
      if (ogDesc) {
        description = ogDesc[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      }
      // Try to get fuller description from initial data
      const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
      if (descMatch) {
        description = descMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }
    }
  } catch {
    // ignore
  }

  // Fetch transcript (subtitles)
  let transcript = '';
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ja' });
    transcript = segments.map((s) => s.text).join(' ');
  } catch {
    // Try without language preference
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = segments.map((s) => s.text).join(' ');
    } catch {
      // No subtitles available
    }
  }

  // Truncate
  if (description.length > 3000) description = description.slice(0, 3000);
  if (transcript.length > 6000) transcript = transcript.slice(0, 6000);

  return { title, description, transcript };
}

export async function extractInstagramContent(url: string): Promise<{
  title: string;
  caption: string;
}> {
  let title = '';
  let caption = '';

  // Try oEmbed
  try {
    const oembed = await fetch(
      `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`
    );
    if (oembed.ok) {
      const data = await oembed.json();
      title = data.title || '';
      caption = data.title || '';
    }
  } catch {
    // ignore
  }

  // Try HTML fetch for more content
  try {
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept-Language': 'ja,en;q=0.5',
      },
      redirect: 'follow',
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const ogDesc = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]*)"/);
      if (ogDesc && ogDesc[1].length > caption.length) {
        caption = ogDesc[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      }
    }
  } catch {
    // ignore
  }

  return { title, caption };
}
