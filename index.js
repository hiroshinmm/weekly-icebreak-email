const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const parser = new Parser();

// 1. Gemini AI による考察生成
async function generateInsight(topic) {
    const configPath = path.join(__dirname, 'config.json');
    const apiKey = process.env.GEMINI_API_KEY || (fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)).gemini_api_key : null);

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.includes('dummy')) {
        console.log('Skipping Insight generation: Gemini API Key is missing or invalid.');
        return '最新のトレンドに基づいた考察（API設定後に自動生成されます）';
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // 現在有効な標準モデル名を使用
        let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
あなたは優秀な翻訳家および技術コンサルタントです。
以下のテックニュースの「タイトル」と「概要」を日本語に自然な表現で翻訳し、さらにソニーのエンジニアが定例ミーティングでワクワクするような鋭い「一言考察（Insight）」を日本語100文字以内で作成してください。

ニュースタイトル: ${topic.title}
ニュース概要: ${topic.snippet}

以下のJSON形式で出力してください。Markdownのコードブロック( \`\`\`json )を含めず、純粋なJSONテキストのみを返してください。
{
  "translatedTitle": "日本語のタイトル",
  "translatedSnippet": "日本語の概要",
  "insight": "日本語の考察"
}
`;

        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (e) {
            console.warn('Fallback due to error:', e.message);
            // フォールバックも1.5系を使用
            model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            result = await model.generateContent(prompt);
        }

        let responseText = result.response.text().trim();
        responseText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const json = JSON.parse(responseText);

        topic.title = json.translatedTitle || topic.title;
        topic.snippet = json.translatedSnippet || topic.snippet;
        return json.insight || '技術革新のスピードに注目です。さらなる進展が期待されます。';
    } catch (err) {
        console.error('Gemini API Error:', err.message);
        return '技術革新のスピードに注目です。さらなる進展が期待されます。';
    }
}

// ニュースソースの読み込み
const sourcesPath = path.join(__dirname, 'sources.json');
let sources = [];
if (fs.existsSync(sourcesPath)) {
    sources = JSON.parse(fs.readFileSync(sourcesPath));
} else {
    // デフォルトソース (ファイルがない場合)
    sources = [
        { category: "OpenSource", urls: ["https://zenn.dev/feed"], keywords: ["js", "ts", "node"] }
    ];
}

// 1. RSSアグリゲーター: 複数ソースから最新かつ関連のあるトピックを取得
async function fetchTopics() {
    console.log('Fetching topics from multiple sources...');
    const allTopics = [];
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));

    for (const source of sources) {
        for (const url of source.urls) {
            try {
                const feed = await parser.parseURL(url);
                for (const item of feed.items) {
                    const pubDate = new Date(item.pubDate || item.isoDate);

                    // 日付フィルタリング (過去10日以内)
                    if (pubDate < tenDaysAgo) continue;

                    // カテゴリーフィルタリング
                    const content = (item.title + (item.contentSnippet || '')).toLowerCase();
                    const isRelevant = source.keywords.some(kw => content.includes(kw.toLowerCase()));

                    if (isRelevant) {
                        let imageUrl = null;

                        // 多様なRSSの画像タグからの抽出対応
                        const possibleImageLocations = [
                            item.enclosure?.url,
                            item.content?.match(/<img[^>]+src="([^">]+)"/i)?.[1],
                            item['content:encoded']?.match(/<img[^>]+src="([^">]+)"/i)?.[1],
                            item.description?.match(/<img[^>]+src="([^">]+)"/i)?.[1],
                            item.itunes?.image
                        ];

                        for (const url of possibleImageLocations) {
                            if (url && url.match(/^https?:\/\//i) && url.match(/\.(jpeg|jpg|gif|png|webp)/i)) {
                                imageUrl = url;
                                break;
                            }
                        }

                        allTopics.push({
                            title: item.title,
                            link: item.link,
                            tag: source.category,
                            pubDate: pubDate.toLocaleDateString('ja-JP'),
                            snippet: (item.contentSnippet || '').slice(0, 200) + '...',
                            imageUrl: imageUrl,
                            insight: '最新のトレンドに基づいた考察（自動生成予定）'
                        });
                    }
                } // /for (const item of feed.items)
            } catch (err) {
                console.error(`Failed to fetch from ${url}:`, err.message);
            }
        }
    }

    // 重複削除 (URLが同じもの)
    const uniqueTopics = Array.from(new Map(allTopics.map(t => [t.link, t])).values());

    // カテゴリーごとに最新を選び、最大8件にする
    const finalTopics = [];
    const foundCategories = new Set();

    // カテゴリーの優先度を保ちつつ抽出
    for (const topic of uniqueTopics) {
        if (!foundCategories.has(topic.tag) && finalTopics.length < 8) {
            finalTopics.push(topic);
            foundCategories.add(topic.tag);
        }
    }

    // 足りない場合は重複カテゴリーでも追加
    if (finalTopics.length < 8) {
        for (const topic of uniqueTopics) {
            if (!finalTopics.find(t => t.link === topic.link) && finalTopics.length < 8) {
                finalTopics.push(topic);
            }
        }
    }

    console.log(`Aggregated ${finalTopics.length} topics.`);
    return finalTopics;
}

// 2. スライド画像の一括生成 (並列処理による高速化)
// ※テストのため一時的に画像生成をスキップ
async function generateAllSlideImages(topics) {
    console.log('Skipping image generation for fast testing...');
    return [];
}

// 3. メール送信
async function sendEmail(attachments, topics) {
    const configPath = path.join(__dirname, 'config.json');

    const user = process.env.GMAIL_USER || (fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)).email.user : null);
    const pass = process.env.GMAIL_PASS || (fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)).email.pass : null);
    const to = process.env.GMAIL_TO || (fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)).email.to : null);

    if (!user || !pass || !to) {
        console.log('Skipping email send: Credentials missing.');
        return;
    }

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
    });

    const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'your-repo';
    const pageUrl = `https://${process.env.GITHUB_REPOSITORY_OWNER || 'your-username'}.github.io/${repoName}/`;

    // HTMLメール本文の組み立て
    const htmlBody = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003399; border-bottom: 2px solid #003399; padding-bottom: 10px;">Weekly Icebreak Trends</h2>
        <p>今週の最新テックトレンドをお届けします。ミーティングのアイスブレイクにご活用ください。</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${pageUrl}" style="background-color: #003399; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Webブラウザで全スライドを見る</a>
        </div>

        <h3 style="margin-top: 40px;">📝 今週のトピック一覧</h3>
        <ul style="list-style-type: none; padding-left: 0;">
            ${topics.map((t, i) => `
                <li style="margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #003399;">
                    <span style="font-size: 12px; color: #64748b; font-weight: bold;">[${t.tag}]</span><br>
                    <a href="${t.link}" style="font-size: 16px; font-weight: bold; color: #1e293b; text-decoration: none;">${t.title}</a>
                    <p style="font-size: 14px; color: #475569; margin-top: 8px;">${t.insight}</p>
                </li>
            `).join('')}
        </ul>
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px;">
            This email is automatically generated by Weekly Icebreak Automation.<br>
            Attached are ${attachments.length} high-resolution slides for your presentation.
        </p>
    </div>
    `;

    await transporter.sendMail({
        from: `"Weekly Icebreak" <${user}>`,
        to: to,
        subject: `[Weekly Ice Break] 最新テックネタ ${topics.length}選`,
        text: `今週のトレンドスライドを生成しました。\n\nWebで見る:\n${pageUrl}\n\nトピック一覧:\n${topics.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
        html: htmlBody,
        attachments: attachments.map(a => ({ filename: a.filename, path: a.path }))
    });
}

async function main() {
    const topics = await fetchTopics();

    // AI考察を全トピックに対して生成 (並列実行)
    console.log(`Generating AI Insights for ${topics.length} topics...`);
    await Promise.all(topics.map(async (topic) => {
        topic.insight = await generateInsight(topic);
    }));

    // 画像を一括で生成 (1回のブラウザ起動で完結)
    const attachments = await generateAllSlideImages(topics);

    // 画像がなくても（テストスキップ時など）、トピックがあればメール送信
    if (topics.length > 0) {
        await sendEmail(attachments, topics);
    } else {
        console.log('No topics found. Skipping email.');
    }
    console.log('Done!');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
