import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();

    if (!image || !mediaType) {
      return NextResponse.json({ error: '画像データが必要です' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mediaType,
          data: image,
        },
      },
      {
        text: `この画像はレシピの写真です。画像に含まれるレシピ情報を読み取って構造化してください。
材料名・分量・単位を正確に読み取ってください。

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
  "memo": "画像から取り込み"
}`,
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'レシピの解析に失敗しました' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('import-recipe-image error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `画像からの取り込みに失敗しました: ${message}` }, { status: 500 });
  }
}
