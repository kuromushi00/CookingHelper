import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    // Fetch the recipe page
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CookingHelper/1.0)',
      },
    });

    if (!pageResponse.ok) {
      return NextResponse.json({ error: 'ページの取得に失敗しました' }, { status: 400 });
    }

    const html = await pageResponse.text();

    // Extract text content (strip HTML tags, limit length)
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `以下はレシピページから抽出したテキストです。このレシピの情報を構造化してください。

## ページテキスト
${textContent}

## カテゴリの選択肢
材料のcategoryは以下から選んでください:
野菜・果物, 肉, 魚, 豆腐・乳製品, 卵, 米・麺・パン, 調味料, 乾物, 冷凍食品, 飲み物, その他

## typeの選択肢
main（メイン料理）, soup（スープ・汁物）, side（副菜）

## cuisineの選択肢
japanese（和食）, western（洋食）, chinese（中華）, other（その他）

以下のJSON形式で回答してください。JSON以外のテキストは不要です:
{
  "name": "レシピ名",
  "type": "main",
  "cuisine": "japanese",
  "servings": 2,
  "ingredients": [
    { "name": "材料名", "amount": 1, "unit": "個", "category": "野菜・果物" }
  ],
  "memo": "元のURL: ${url}"
}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'レシピの解析に失敗しました' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('import-recipe error:', error);
    return NextResponse.json({ error: 'レシピの取り込みに失敗しました' }, { status: 500 });
  }
}
