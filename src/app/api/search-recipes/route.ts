import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 15;

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function searchRecipes(query: string): Promise<SearchResult[]> {
  const searchQuery = encodeURIComponent(`${query} レシピ 作り方 材料`);
  const url = `https://html.duckduckgo.com/html/?q=${searchQuery}&kl=jp-jp`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html',
      'Accept-Language': 'ja,en;q=0.5',
    },
  });

  if (!res.ok) {
    throw new Error('検索に失敗しました');
  }

  const html = await res.text();
  const results: SearchResult[] = [];

  // Parse DuckDuckGo HTML results
  const resultBlocks = html.split(/class="result\s/);
  for (let i = 1; i < resultBlocks.length && results.length < 8; i++) {
    const block = resultBlocks[i];

    // Extract URL from result__a href
    const urlMatch = block.match(/class="result__a"[^>]*href="([^"]+)"/);
    if (!urlMatch) continue;

    // DuckDuckGo wraps URLs in a redirect - extract actual URL
    let resultUrl = urlMatch[1];
    const uddgMatch = resultUrl.match(/uddg=([^&]+)/);
    if (uddgMatch) {
      resultUrl = decodeURIComponent(uddgMatch[1]);
    }

    // Skip search engines and list/search pages (not individual recipes)
    if (resultUrl.includes('duckduckgo.com') || resultUrl.includes('google.com')) continue;
    if (/\/search[\/?]|\/search\/|\/categor|\/curations\/|\/recipe_list\/|\/series\/|\/ingredients\/|\/video_categories\/|\/keyword:/.test(resultUrl)) continue;

    // Extract title
    const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : '';

    // Skip pages that are clearly recipe collection/ranking pages (not individual recipes)
    if (/\d+選|ランキング|Top\d+/i.test(title) && !/作り方|レシピ\//.test(resultUrl)) continue;

    // Extract snippet
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
