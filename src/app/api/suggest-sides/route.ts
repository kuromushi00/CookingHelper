import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { mainRecipeName, cuisine, existingRecipeNames } = await req.json();

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `メイン料理「${mainRecipeName}」（${cuisine}）に合うスープ/汁物と副菜を提案してください。

## 登録済みレシピ
${existingRecipeNames.join(', ')}

## ルール
- 登録済みレシピから選べる場合はそのレシピ名を使ってください
- 新しいレシピを提案する場合は具体的な料理名を書いてください
- スープ2候補、副菜3候補を提案してください

以下のJSON形式で回答してください。JSON以外のテキストは不要です:
{
  "soups": ["スープ名1", "スープ名2"],
  "sides": ["副菜名1", "副菜名2", "副菜名3"]
}`,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI応答の解析に失敗しました' }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('suggest-sides error:', error);
    return NextResponse.json({ error: '提案の取得に失敗しました' }, { status: 500 });
  }
}
