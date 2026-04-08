import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 15;

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function searchRecipes(query: string): Promise<SearchResult[]> {
  const searchQuery = `${query} レシピ 作り方`;

  // DuckDuckGo HTML search via POST (more reliable from server environments)
  const attempts = [
    { url: 'https://html.duckduckgo.com/html/', body: `q=${encodeURIComponent(searchQuery)}&kl=jp-jp` },
    { url: 'https://lite.duckduckgo.com/lite/', body: `q=${encodeURIComponent(searchQuery)}&kl=jp-jp` },
  ];

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, {
        method: 'POST',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        },
        body: attempt.body,
      });

      if (!res.ok) continue;

      const html = await res.text();

      // Try standard HTML format first
      let results = parseStandardResults(html);
      if (results.length > 0) return results;

      // Try Lite format
      results = parseLiteResults(html);
      if (results.length > 0) return results;
    } catch {
      continue;
    }
  }

  throw new Error('検索に失敗しました。しばらくしてからお試しください。');
}

function isUsefulUrl(url: string): boolean {
  if (url.includes('duckduckgo.com') || url.includes('google.com')) return false;
  if (/\/search[\/?]|\/categor|\/video_categories\//.test(url)) return false;
  return true;
}

function extractUrl(rawUrl: string): string {
  const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
  if (uddgMatch) return decodeURIComponent(uddgMatch[1]);
  return rawUrl;
}

function parseStandardResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];
  const resultBlocks = html.split(/class="result\s/);

  for (let i = 1; i < resultBlocks.length && results.length < 12; i++) {
    const block = resultBlocks[i];

    const urlMatch = block.match(/class="result__a"[^>]*href="([^"]+)"/);
    if (!urlMatch) continue;

    const resultUrl = extractUrl(urlMatch[1]);
    if (!isUsefulUrl(resultUrl)) continue;

    const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : '';

    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|td|div|span)>/);
    const snippet = snippetMatch
      ? snippetMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : '';

    if (title && resultUrl) {
      results.push({ title, url: resultUrl, snippet });
    }
  }

  return results;
}

function parseLiteResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  // Lite format: links with rel="nofollow" or in table rows
  const linkPattern = /<a[^>]+href="(\/\/duckduckgo\.com\/l\/\?[^"]+|https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = linkPattern.exec(html)) !== null && results.length < 12) {
    let resultUrl = match[1];
    if (resultUrl.startsWith('//')) resultUrl = 'https:' + resultUrl;
    resultUrl = extractUrl(resultUrl);
    if (!isUsefulUrl(resultUrl)) continue;

    const title = match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!title || title.length < 3) continue;
    // Skip navigation links
    if (/^(Next|Previous|Back|\d+)$/.test(title)) continue;

    // Try to find a snippet near this link
    const afterLink = html.slice(match.index + match[0].length, match.index + match[0].length + 500);
    const snippetMatch = afterLink.match(/class="[^"]*snippet[^"]*"[^>]*>([\s\S]*?)<\//);
    const snippet = snippetMatch
      ? snippetMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : '';

    results.push({ title, url: resultUrl, snippet });
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: '検索キーワードを入力してください' }, { status: 400 });
    }

    const results = await searchRecipes(query.trim());

    if (results.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'レシピが見つかりませんでした。別のキーワードで試してみてください。',
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('search-recipes error:', error);
    return NextResponse.json(
      { error: 'レシピの検索に失敗しました' },
      { status: 500 }
    );
  }
}
