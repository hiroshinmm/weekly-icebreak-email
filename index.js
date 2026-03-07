const { GoogleGenerativeAI } = require('@google/generative-ai');

const parser = new Parser();

// 1. Gemini AI による考察生成
async function generateInsight(topic) {
    const configPath = path.join(__dirname, 'config.json');
    const apiKey = process.env.GEMINI_API_KEY || (fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)).gemini_api_key : null);

    if (!apiKey) {
        console.log('Skipping Insight generation: Gemini API Key missing.');
        return '最新のトレンドに基づいた考察（API設定後に自動生成されます）';
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
あなたは世界最高峰の技術コンサルタントです。以下のテックニュースの「タイトル」と「概要」を読み、ソニーのハードウェア/ソフトウェアエンジニアが定例ミーティングで盛り上がれるような、鋭く、ワクワクする「一言考察（Insight）」を日本語で100文字以内で作成してください。

ニュースタイトル: ${topic.title}
ニュース概要: ${topic.snippet}
カテゴリー: ${topic.tag}

要件:
- エンジニア視点で、その技術が将来どう化けるか、または既存の技術にどう影響するかを含めてください。
- 丁寧語（〜です、〜でしょう）を使用してください。
- 堅苦しすぎず、アイスブレイクにふさわしい知的な刺激を与えてください。
`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
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
                        allTopics.push({
                            title: item.title,
                            link: item.link,
                            tag: source.category,
                            pubDate: pubDate.toLocaleDateString('ja-JP'),
                            snippet: (item.contentSnippet || '').slice(0, 150) + '...',
                            insight: '最新のトレンドに基づいた考察（自動生成予定）'
                        });
                    }
                }
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

// 2. スライド画像生成 (A4 Landscape, White Theme)
async function generateSlideImage(topic, index) {
    console.log(`Generating slide image ${index}: ${topic.tag}...`);

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1414, height: 1000 });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap');
            body {
                margin: 0;
                width: 1414px;
                height: 1000px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: #f8fafc;
                color: #1e293b;
                font-family: 'Inter', 'Noto Sans JP', sans-serif;
                overflow: hidden;
            }
            .container {
                width: 90%;
                height: 80%;
                display: flex;
                background: white;
                border-radius: 48px;
                overflow: hidden;
                box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.08);
            }
            .content-left {
                flex: 1.1;
                padding: 60px 80px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: left;
            }
            .content-right {
                flex: 0.9;
                background: #f1f5f9;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 40px;
            }
            .tag {
                display: inline-block;
                padding: 6px 18px;
                background: #003399;
                color: white;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 24px;
                letter-spacing: 0.05em;
            }
            .topic-title {
                font-size: 36px;
                line-height: 1.3;
                margin-bottom: 24px;
                font-weight: 700;
                color: #0f172a;
            }
            .topic-snippet {
                font-size: 18px;
                line-height: 1.6;
                color: #64748b;
                margin-bottom: 32px;
            }
            .gemini-insight {
                background: #f8fafc;
                border-left: 6px solid #003399;
                padding: 24px 30px;
                border-radius: 0 16px 16px 0;
                margin-bottom: 30px;
            }
            .insight-header {
                font-size: 14px;
                font-weight: 700;
                color: #003399;
                margin-bottom: 8px;
            }
            .insight-text {
                font-size: 17px;
                line-height: 1.5;
                color: #334155;
            }
            .footer-info {
                margin-top: auto;
                color: #94a3b8;
                font-size: 13px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content-left">
                <div class="tag">${topic.tag}</div>
                <div class="topic-title">${topic.title}</div>
                <div class="topic-snippet">${topic.snippet}</div>
                <div class="gemini-insight">
                    <div class="insight-header">INSIGHT</div>
                    <div class="insight-text">${topic.insight}</div>
                </div>
                <div class="footer-info">
                    Source: ${topic.tag} | Published: ${topic.pubDate}
                </div>
            </div>
            <div class="content-right">
                <div style="font-size:120px;">📰</div>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    const fileName = `icebreak_slide_${index}.png`;
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const outputPath = path.join(outputDir, fileName);

    await page.screenshot({ path: outputPath });
    await browser.close();
    console.log('Image generated at:', outputPath);
    return { path: outputPath, filename: fileName };
}

// 3. メール送信
async function sendEmail(attachments, topics) {
    const configPath = path.join(__dirname, 'config.json');

    // GitHub Actions環境では環境変数を使用
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

    const pageUrl = `https://${process.env.GITHUB_REPOSITORY_OWNER || 'your-username'}.github.io/${process.env.GITHUB_REPOSITORY_NAME || 'your-repo'}/docs/`;

    await transporter.sendMail({
        from: `"Weekly Icebreak" <${user}>`,
        to: to,
        subject: `[Weekly Icebreak] 最新テックトレンド ${topics.length}選`,
        text: `今週のトレンドスライドを生成しました。\n\nWebで見る:\n${pageUrl}\n\nトピック一覧:\n${topics.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
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

    const attachments = [];
    for (let i = 0; i < topics.length; i++) {
        attachments.push(await generateSlideImage(topics[i], i));
    }
    if (attachments.length > 0) await sendEmail(attachments, topics);
    console.log('Done!');
}

main().catch(err => console.error(err));
