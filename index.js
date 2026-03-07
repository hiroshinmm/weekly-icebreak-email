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
        let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
あなたは優秀な翻訳家および技術コンサルタントです。
以下のテックニュースの「タイトル」と「概要」をもとに、以下の3点を作成してください。

1. 日本語のタイトル
2. ニュースの詳細な要約（途中で文章が切れないよう、意味が通る完全な日本語の文章で100〜150文字程度に要約）
3. ソニーのエンジニアが定例ミーティングでワクワクするような鋭い「一言考察（Insight）」（日本語で【400文字程度】のしっかりした文章）

【Insightに必ず含めるべき3つの観点】
1. このニュース・技術の背景と現在のトレンドにおける立ち位置
2. 技術的な面白さ、またはビジネス面での破壊的価値
3. ソニー（または自社）のエンジニアとして、この技術を受けて今後どのような議論・アクションを起こすべきか

ニュースタイトル: ${topic.title}
ニュース概要: ${topic.snippet}

以下のJSON形式で出力してください。Markdownのコードブロック( \`\`\`json )を含めず、純粋なJSONテキストのみを返してください。
{
  "translatedTitle": "日本語のタイトル",
  "translatedSnippet": "要約した完全な日本語の概要",
  "insight": "日本語の考察"
}
`;

        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (e) {
            console.warn('Fallback due to error:', e.message);
            // フォールバックも1.5系を使用
            model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
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
                            item.itunes?.image,
                            item.image?.url
                        ];

                        for (const url of possibleImageLocations) {
                            if (url && url.match(/^https?:\/\//i) && url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
                                imageUrl = url;
                                break;
                            }
                        }

                        const cleanSnippet = (item.contentSnippet || item.content || '').replace(/(<([^>]+)>)/gi, "").trim();

                        allTopics.push({
                            title: item.title,
                            link: item.link,
                            tag: source.category,
                            pubDate: pubDate.toLocaleDateString('ja-JP'),
                            snippet: cleanSnippet.length > 800 ? cleanSnippet.slice(0, 800) + '...' : cleanSnippet,
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

    // 各カテゴリーごとに必ず1件 (最新のもの) を追加する
    const finalTopics = [];

    for (const source of sources) {
        // 現在のカテゴリーに一致する記事を探す
        const categoryTopics = uniqueTopics.filter(t => t.tag === source.category);

        if (categoryTopics.length > 0) {
            // 見つかった場合は先頭（最新）を追加
            finalTopics.push(categoryTopics[0]);
        } else {
            // 見つからなかった場合はプレースホルダーを追加
            finalTopics.push({
                title: "今週の最新ニュースはありませんでした",
                link: "#",
                tag: source.category,
                pubDate: "---",
                snippet: "該当カテゴリの過去10日以内の関連ニュースは見つかりませんでした。",
                imageUrl: null,
                insight: "引き続き次回以降のアップデートにご期待ください。"
            });
        }
    }

    console.log(`Aggregated ${finalTopics.length} topics.`);
    return finalTopics;
}

// 2. スライド画像の一括生成 (並列処理による高速化)
async function generateAllSlideImages(topics) {
    if (topics.length === 0) return [];
    console.log('Launching browser for image generation...');
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const docsDir = path.join(__dirname, 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);
    const outputDir = path.join(docsDir, 'output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const attachments = await Promise.all(topics.map(async (topic, index) => {
        console.log(`Generating slide image ${index}: ${topic.tag}...`);
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
                    padding: 0;
                    overflow: hidden;
                    position: relative;
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
                <div class="content-right" style="position: relative; background: #e2e8f0; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: hidden; width: 100%; height: 100%;">
                    ${topic.imageUrl ? `
                    <img src="${topic.imageUrl}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; z-index:1;" onerror="this.style.display='none'; document.getElementById('fallback-${index}').style.display='flex'">
                    <div id="fallback-${index}" style="position: absolute; display: none; font-size:120px; z-index:0; width: 100%; height: 100%; justify-content: center; align-items: center; flex-direction: column; color: #94a3b8;">
                        <span style="font-size:120px; margin-bottom: 20px;">📰</span>
                        <span style="font-size:24px; font-weight: bold;">No Image Available</span>
                    </div>
                    ` : `
                    <div style="display: flex; flex-direction: column; align-items: center; color: #94a3b8;">
                        <span style="font-size:120px; margin-bottom: 20px;">📰</span>
                        <span style="font-size:24px; font-weight: bold;">No Image Available</span>
                    </div>
                    `}
                </div>
            </div>
        </body>
        </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        const fileName = `icebreak_slide_${index}.png`;
        const outputPath = path.join(outputDir, fileName);

        await page.screenshot({ path: outputPath });
        await page.close(); // ページのみ閉じる

        return { path: outputPath, filename: fileName };
    }));

    await browser.close(); // 全ての処理が終わってからブラウザを閉じる
    console.log('All images generated successfully.');
    return attachments;
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

    // ========== 3. Webページ(docs/index.html)の生成を追加 ==========
    const docsDir = path.join(__dirname, 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);

    const indexHtml = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Ice Break Slides</title>
        <style>
            :root { --bg: #f8fafc; --text: #1e293b; --accent: #003399; }
            body { font-family: 'Inter', -apple-system, sans-serif; background-color: var(--bg); color: var(--text); padding: 40px; display: flex; flex-direction: column; align-items: center; }
            header { text-align: center; margin-bottom: 60px; }
            h1 { font-size: 2.5rem; color: var(--accent); margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(600px, 1fr)); gap: 40px; width: 100%; max-width: 1400px; }
            .slide-card { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .slide-card img { width: 100%; height: auto; display: block; border-bottom: 1px solid #e2e8f0; }
            .slide-info { padding: 30px; font-size: 16px; line-height: 1.6; }
            .slide-info a { color: var(--accent); text-decoration: none; font-size: 1.2rem; font-weight: bold; display: block; margin-bottom: 20px;}
            .slide-info a:hover { text-decoration: underline; }
            .slide-tag { display: inline-block; font-size: 12px; background: var(--accent); color: white; padding: 6px 12px; border-radius: 6px; margin-bottom: 16px; font-weight: bold;}
            .insight-box { background: #f1f5f9; border-left: 4px solid var(--accent); padding: 20px; border-radius: 0 8px 8px 0; margin-top: 20px; }
            .insight-label { font-size: 12px; font-weight: bold; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em; }
            .insight-text { font-size: 15px; color: #334155; margin: 0; }
        </style>
    </head>
    <body>
        <header>
            <h1>Weekly Ice Break Trends</h1>
            <p>エンジニアのための最新テックトレンド・スライド</p>
        </header>

        <div class="grid" id="slide-grid">
            ${topics.map((t, i) => `
            <div class="slide-card">
                <img src="output/icebreak_slide_${i}.png" alt="Slide ${i}">
                <div class="slide-info">
                    <div class="slide-tag">${t.tag}</div>
                    <a href="${t.link}" target="_blank" rel="noopener noreferrer">🔗 ${t.title}</a>
                    <div class="insight-box">
                        <div class="insight-label">Insight</div>
                        <p class="insight-text">${t.insight}</p>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </body>
    </html>
    `;
    fs.writeFileSync(path.join(docsDir, 'index.html'), indexHtml);
    console.log('docs/index.html generated successfully.');

    // =========================================================

    // HTMLメール本文の組み立て
    const htmlBody = `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003399; border-bottom: 2px solid #003399; padding-bottom: 10px;">Weekly Ice Break Trends</h2>
        <p>今週の最新テックトレンドをお届けします。ミーティングのアイスブレイクにご活用ください。</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${pageUrl}" style="background-color: #003399; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Webブラウザで全スライドを見る</a>
        </div>

        <h3 style="margin-top: 40px;">📝 今週のトピック一覧</h3>
        <ul style="list-style-type: none; padding-left: 0;">
            ${topics.map((t, i) => {
        const attachmentName = `icebreak_slide_${i}.png`;
        return `
                <li style="margin-bottom: 40px; padding: 20px; background-color: #f8fafc; border-radius: 12px; border-left: 6px solid #003399; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <span style="display: inline-block; padding: 4px 10px; background: #003399; color: white; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px;">${t.tag}</span><br>
                    <a href="${t.link}" style="font-size: 18px; font-weight: bold; color: #1e293b; text-decoration: none;">${t.title}</a>
                    <div style="font-size: 14px; color: #475569; margin-top: 10px; line-height: 1.6;">${t.snippet}</div>
                    <div style="font-size: 15px; color: #1e293b; margin-top: 15px; padding: 15px; background: #e2e8f0; border-radius: 8px;"><strong>💡 Insight:</strong><br>${t.insight}</div>
                    <div style="margin-top: 20px; text-align: center;">
                        <img src="cid:${attachmentName}" alt="Slide ${i}" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; border: 1px solid #cbd5e1;">
                    </div>
                </li>
                `;
    }).join('')}
        </ul>
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px;">
            This email is automatically generated by Weekly Ice Break Automation.<br>
            Attached are ${attachments.length} high-resolution slides for your presentation.
        </p>
    </div>
    `;

    await transporter.sendMail({
        from: `"Weekly Ice Break" <${user}>`,
        to: to,
        subject: `[Weekly Ice Break] 最新テックネタ ${topics.length}選`,
        text: `今週のトレンドスライドを生成しました。\n\nWebで見る:\n${pageUrl}\n\nトピック一覧:\n${topics.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
        html: htmlBody,
        attachments: attachments.map(a => ({ filename: a.filename, path: a.path, cid: a.filename }))
    });
}

async function main() {
    const topics = await fetchTopics();

    // AI考察を全トピックに対して生成 (APIのレートリミット回避のため直列実行し1秒待機)
    console.log(`Generating AI Insights for ${topics.length} topics...`);
    for (const topic of topics) {
        topic.insight = await generateInsight(topic);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

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
