import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { recipeNames, previousWeekMenuNames, servings } = await req.json();

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `あなたは家庭料理の献立アドバイザーです。
1週間分の夕食献立を提案してください。各日にメイン料理1品、スープ/汁物1品、副菜1品を提案してください。

## 使用可能なレシピ一覧（カッコ内は種類）
${recipeNames.join(', ')}

## 前週の献立（重複を避けてください）
${previousWeekMenuNames.length > 0 ? previousWeekMenuNames.join(', ') : 'なし'}

## 人数
${servings}人前

## ルール
- 使用可能なレシピ一覧から選んでください。レシピ名はカッコ部分を除いた名前のみを返してください（例: "肉じゃが(main)" → "肉じゃが"）
- 一覧にないレシピを提案する場合は、レシピ名の後に「(新規)」を付けてください
- 和洋中のバランスを考慮してください
- 同じ食材が続かないようにしてください
- 前週の献立と重複しないようにしてください

以下のJSON形式で回答してください。JSON以外のテキストは不要です:
{
  "days": [
    { "day": "mon", "main": "レシピ名", "soup": "レシピ名", "sides": ["レシピ名"] },
    { "day": "tue", "main": "レシピ名", "soup": "レシピ名", "sides": ["レシピ名"] },
    { "day": "wed", "main": "レシピ名", "soup": "レシピ名", "sides": ["レシピ名"] },
    { "day": "thu", "main": "レシピ名", "soup": "レシピ名", "sides": ["レシピ名"] },
    { "day": "fri", "main": "レシピ名", "soup": "レシピ名", "sides": ["レシピ名"] },
    { "day": "sat", "main": "レシピ名", "soup": "レシピ名", "sides": ["レシピ名"] },
    { "day": "sun", "main": "レシピ名", "soup": "レシピ名", "sides": ["レシピ名"] }
  ]
}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('AI response text:', text);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse JSON from AI response:', text);
      return NextResponse.json({ error: 'AI応答の解析に失敗しました' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('suggest-menu error:', error);
    return NextResponse.json({ error: '献立の提案に失敗しました' }, { status: 500 });
  }
}
