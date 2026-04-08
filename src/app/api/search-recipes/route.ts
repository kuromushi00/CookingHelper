import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 15;

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function searchRecipes(query: string): Promise<SearchResult[]> {
  const searchQuery = `${query} レシピ 作り方 材料`;

  // Try DuckDuckGo HTML first, fall back to DuckDuckGo Lite
  const urls = [
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}&kl=jp-jp`,
    `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(searchQuery)}&kl=jp-jp`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        },
      });

      if (!res.ok) continue;

      const html = await res.text();
      const results = parseDuckDuckGoResults(html);
      if (results.length > 0) return results;
    } catch {
      continue;
    }
  }

  throw new Error('検索に失敗しました。しばらくしてからお試しください。');
}

function parseDuckDuckGoResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  // Try standard HTML format
  const resultBlocks = html.split(/class="result\s/);
  for (let i = 1; i < resultBlocks.length && results.length < 8; i++) {
    const block = resultBlocks[i];

    const urlMatch = block.match(/class="result__a"[^>]*href="([^"]+)"/);
    if (!urlMatch) continue;

    let resultUrl = urlMatch[1];
    const uddgMatch = resultUrl.match(/uddg=([^&]+)/);
    if (uddgMatch) {
      resultUrl = decodeURIComponent(uddgMatch[1]);
    }

    if (resultUrl.includes('duckduckgo.com') || resultUrl.includes('google.com')) continue;
    if (/\/search[\/?]|\/search\/|\/categor|\/curations\/|\/recipe_list\/|\/series\/|\/ingredients\/|\/video_categories\/|\/keyword:/.test(resultUrl)) continue;

    const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : '';

    if (/\d+選|ランキング|Top\d+/i.test(title) && !/作り方|レシピ\//.test(resultUrl)) continue;

    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|td|div|span)>/);
    const snippet = snippetMatch
      ? snippetMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : '';

    if (title && resultUrl) {
      results.push({ title, url: resultUrl, snippet });
    }
  }

  // Try Lite format if standard didn't work
  if (results.length === 0) {
    const linkMatches = html.matchAll(/<a[^>]+rel="nofollow"[^>]+href="([^"]+)"[^>]*class="result-link"[^>]*>([\s\S]*?)<\/a>/g);
    for (const m of linkMatches) {
      if (results.length >= 8) break;
      let resultUrl = m[1];
      const uddgMatch = resultUrl.match(/uddg=([^&]+)/);
      if (uddgMatch) resultUrl = decodeURIComponent(uddgMatch[1]);
      if (resultUrl.includes('duckduckgo.com')) continue;

      const title = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (title && resultUrl) {
        results.push({ title, url: resultUrl, snippet: '' });
      }
    }
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
