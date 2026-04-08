import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  isYouTubeUrl,
  isInstagramUrl,
  extractYouTubeContent,
  extractInstagramContent,
} from './video-extractors';

const client = new Anthropic();

export const maxDuration = 30;

const CATEGORY_AND_FORMAT = `
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
  "memo": ""
}`;

async function buildPrompt(url: string): Promise<string> {
  // YouTube
  if (isYouTubeUrl(url)) {
    const { title, description, transcript } = await extractYouTubeContent(url);

    if (!description && !transcript) {
      throw new Error('動画の字幕・説明文を取得できませんでした。動画が非公開または字幕がない可能性があります。');
    }

    return `以下はYouTube料理動画から抽出した情報です。動画の字幕・説明文からレシピの情報を構造化してください。
字幕は話し言葉なので、材料名や分量を注意深く読み取ってください。
説明文に材料リストがある場合はそちらを優先してください。

## 動画タイトル
${title}

## 動画の説明文
${description || '（なし）'}

## 動画の字幕
${transcript || '（なし）'}

${CATEGORY_AND_FORMAT.replace('"memo": ""', `"memo": "YouTube動画: ${url}"`)}`;
  }

  // Instagram
  if (isInstagramUrl(url)) {
    const { title, caption } = await extractInstagramContent(url);

    if (!caption || caption.length < 30) {
      throw new Error('Instagramの投稿内容を取得できませんでした。投稿のスクリーンショットを撮って、写真取り込み機能をお試しください。');
    }

    return `以下はInstagramの料理投稿から抽出した情報です。投稿のキャプションからレシピの情報を構造化してください。
情報が不足している場合は、料理名から推測して一般的な材料を記載してください。

## 投稿タイトル
${title}

## 投稿のキャプション
${caption}

${CATEGORY_AND_FORMAT.replace('"memo": ""', `"memo": "Instagram投稿: ${url}"`)}`;
  }

  // Regular website (existing logic)
  const pageResponse = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
    },
    redirect: 'follow',
  });

  if (!pageResponse.ok) {
    throw new Error(`ページの取得に失敗しました（${pageResponse.status}）。このサイトはURL取り込みに対応していない可能性があります。`);
  }

  const html = await pageResponse.text();
  const textContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);

  return `以下はレシピページから抽出したテキストです。このレシピの情報を構造化してください。

## ページテキスト
${textContent}

${CATEGORY_AND_FORMAT.replace('"memo": ""', `"memo": "元のURL: ${url}"`)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const prompt = await buildPrompt(url);

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'レシピの解析に失敗しました' }, { status: 500 });
    }

    // Fix common JSON issues: unquoted values like 大さじ1
    let jsonStr = jsonMatch[0];
    // Fix: "amount": 大さじ1 → "amount": 1 (move unit text to unit field is handled by AI, but fix parse)
    jsonStr = jsonStr.replace(/"amount"\s*:\s*([^"\d\s\[][^\s,}\]]*)/g, '"amount": 0');
    // Fix: trailing commas before } or ]
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      // If greedy regex captured too much, try extracting the first balanced JSON object
      let depth = 0;
      let end = -1;
      for (let i = 0; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') depth++;
        else if (jsonStr[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
      }
      if (end > 0) {
        result = JSON.parse(jsonStr.slice(0, end));
      } else {
        return NextResponse.json({ error: 'レシピの解析に失敗しました' }, { status: 500 });
      }
    }

    // If AI returned a collection page with multiple recipes, extract the first one
    if (result.recipes && Array.isArray(result.recipes) && result.recipes.length > 0 && !result.ingredients) {
      const first = result.recipes[0];
      result = {
        name: first.recipeName || first.name || '',
        type: first.type || 'main',
        cuisine: first.cuisine || 'japanese',
        servings: first.servings || 2,
        ingredients: Array.isArray(first.ingredients)
          ? first.ingredients.map((ing: string | { name: string; amount?: number; unit?: string; category?: string }) =>
              typeof ing === 'string'
                ? { name: ing, amount: 0, unit: '', category: 'その他' }
                : { name: ing.name, amount: ing.amount ?? 0, unit: ing.unit ?? '', category: ing.category ?? 'その他' }
            )
          : [],
        memo: first.memo || first.source || '',
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('import-recipe error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `レシピの取り込みに失敗しました: ${message}` }, { status: 500 });
  }
}
