import { NextRequest, NextResponse } from 'next/server';
import { tavily } from '@tavily/core';

export const maxDuration = 15;

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

async function searchRecipes(query: string): Promise<SearchResult[]> {
  const response = await tvly.search(`${query} レシピ 作り方`, {
    maxResults: 12,
    topic: 'general',
  });

  return response.results
    .filter((r) => r.url && r.title)
    .map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content || '',
    }));
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
