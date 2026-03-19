const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateInsight(topic, apiKey) {
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.includes('dummy')) {
        console.log('Skipping Insight generation: Gemini API Key is missing or invalid.');
        return '最新のトレンドに基づいた考察（API設定後に自動生成されます）';
    }

    try {
        const schema = {
            description: "Translated news content and professional insight",
            type: "object",
            properties: {
                translatedTitle: { type: "string", description: "Japanese translation of the news title" },
                translatedSnippet: { type: "string", description: "A complete, natural Japanese summary of the news (100-150 characters), not cut off" },
                insight: { type: "string", description: "Deep technical insight in Japanese for engineers (around 200 characters)" }
            },
            required: ["translatedTitle", "translatedSnippet", "insight"]
        };

        const genAI = new GoogleGenerativeAI(apiKey);
        const prompt = `
あなたは優秀な翻訳家および技術コンサルタントです。
以下のテックニュースの「タイトル」と「概要」をもとに、プロフェッショナルな日本語コンテンツを作成してください。

【出力要件】
1. ニュースタイトルを、ソニーのエンジニア向けに適切で興味深い日本語に翻訳してください（translatedTitle）。
2. ニュースの内容を、途中で文章が切れないよう、意味が通る完全な日本語の文章で100〜150文字程度に要約してください（translatedSnippet）。
3. エンジニアがワクワクするような鋭い「一言考察（Insight）」を日本語で【200文字程度】作成してください（insight）。

【Insightに必ず含めるべき観点】
- この技術の背景とトレンドにおける立ち位置
- 技術的な面白さ、またはビジネス面での破壊的価値
- エンジニアとして今後どのような議論・アクションを起こすべきか

ニュースタイトル: ${topic.title}
ニュース概要: ${topic.snippet}
`;

        const MODEL_LIST = [
            "gemini-3.1-flash-lite",
            "gemini-3.0-flash",
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
        ];

        const modelConfig = (modelName) => genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        });

        let result;
        let lastError;
        for (const modelName of MODEL_LIST) {
            try {
                console.log(`Trying model: ${modelName}`);
                const model = modelConfig(modelName);
                result = await model.generateContent(prompt);
                break;
            } catch (e) {
                const is429 = e.message && e.message.includes('429');
                const isDayLimit = is429 && e.message.includes('PerDay');

                if (is429 && !isDayLimit) {
                    const retryMatch = e.message.match(/retry in (\d+(\.\d+)?)s/i);
                    const waitSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) + 5 : 30;
                    console.warn(`[${modelName}] Rate limited. Waiting ${waitSec}s...`);
                    await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
                    try {
                        const model = modelConfig(modelName);
                        result = await model.generateContent(prompt);
                        break;
                    } catch (e2) {
                        lastError = e2;
                    }
                } else {
                    lastError = e;
                }
            }
        }

        if (!result) throw lastError || new Error('All Gemini models failed.');

        let responseText = result.response.text().trim();
        responseText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const json = JSON.parse(responseText);

        topic.title = json.translatedTitle || topic.title;
        topic.snippet = json.translatedSnippet || topic.snippet;
        console.log(`✅ Translated: "${topic.title.slice(0, 30)}..."`);
        return json.insight || 'AIによる考察の生成に失敗しました。';
    } catch (err) {
        console.error('Gemini API Error details:', err);
        return `AI考察生成エラー: ${err.message.slice(0, 100)}`;
    }
}

module.exports = { generateInsight };
