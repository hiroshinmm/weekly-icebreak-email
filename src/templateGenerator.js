function generateEmailTemplate(topics, pageUrl) {
    return `
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; background-color: #fff;">
        <header style="text-align: center; padding: 20px 0;">
            <h1 style="color: #003399; margin: 0;">Weekly Ice Break</h1>
            <p style="color: #64748b; font-size: 14px;">エンジニアのための最新テックトレンド</p>
        </header>
        
        <div style="padding: 20px;">
            ${topics.map((t, i) => {
        const attachmentName = `news_image_${i}.png`;
        return `
                <div style="margin-bottom: 50px; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                    <div style="padding: 24px 24px 0 24px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 20px; line-height: 1.4;">
                            <a href="${t.link}" style="color: #1e293b; text-decoration: none;">${t.title}</a>
                        </h2>
                    </div>
                    <div style="width: 100%;">
                        <img src="cid:${attachmentName}" alt="${t.title}" style="width: 100%; display: block; object-fit: cover;">
                    </div>
                    <div style="padding: 24px;">
                        <span style="display: inline-block; padding: 4px 10px; background: #003399; color: white; border-radius: 4px; font-size: 11px; font-weight: bold; margin-bottom: 12px;">${t.tag}</span>
                        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 20px;">${t.snippet}</p>
                        <div style="background-color: #f1f5f9; border-left: 5px solid #003399; padding: 16px; border-radius: 0 8px 8px 0;">
                            <strong style="color: #003399; font-size: 13px; display: block; margin-bottom: 4px;">💡 AI INSIGHT</strong>
                            <div style="font-size: 14px; color: #334155; line-height: 1.6;">${t.insight}</div>
                        </div>
                    </div>
                </div>
                `;
    }).join('')}
        </div>
        
        <footer style="text-align: center; padding: 30px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
            <p>Weekly Ice Break Trends | <a href="${pageUrl}" style="color: #003399;">Webブラウザで見る</a></p>
        </footer>
    </div>
    `;
}

function generateIndexHtml(topics) {
    return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Ice Break News</title>
        <style>
            :root { --accent: #003399; --bg: #f8fafc; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, 'Noto Sans JP', sans-serif; background: var(--bg); padding: 20px; color: #1e293b; }
            header { text-align: center; padding: 40px 20px; }
            h1 { font-size: clamp(1.5rem, 4vw, 2.5rem); color: var(--accent); }
            header p { color: #64748b; margin-top: 8px; }
            .cards { display: flex; flex-direction: column; gap: 40px; max-width: 800px; margin: 0 auto; }
            .card { background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .img-container { width: 100%; aspect-ratio: 16/9; overflow: hidden; }
            .img-container img { width: 100%; height: 100%; object-fit: cover; }
            .card-body { padding: 32px; }
            .tag { display: inline-block; background: var(--accent); color: #fff; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 6px; margin-bottom: 16px; }
            .card-title { font-size: 1.5rem; font-weight: bold; line-height: 1.4; margin-bottom: 16px; }
            .card-title a { color: inherit; text-decoration: none; }
            .card-title a:hover { color: var(--accent); }
            .card-snippet { font-size: 1rem; line-height: 1.7; color: #475569; margin-bottom: 24px; }
            .insight-box { background: #f1f5f9; border-left: 6px solid var(--accent); padding: 20px 24px; border-radius: 0 12px 12px 0; }
            .insight-label { font-size: 12px; font-weight: bold; color: var(--accent); margin-bottom: 8px; }
            .insight-text { font-size: 0.95rem; line-height: 1.7; color: #334155; }
        </style>
    </head>
    <body>
        <header>
            <h1>Weekly Ice Break News</h1>
            <p>エンジニアのための最新テックトレンド</p>
        </header>
        <div class="cards">
            ${topics.map((t, i) => `
            <div class="card">
                <div class="card-body" style="padding-bottom: 0;">
                    <div class="card-title" style="margin-bottom: 20px;"><a href="${t.link}" target="_blank">${t.title}</a></div>
                </div>
                <div class="img-container">
                    <img src="output/news_image_${i}.png" alt="${t.title}" loading="lazy">
                </div>
                <div class="card-body" style="padding-top: 24px;">
                    <div class="tag" style="margin-bottom: 12px;">${t.tag}</div>
                    <div class="card-snippet">${t.snippet}</div>
                    <div class="insight-box">
                        <div class="insight-label">💡 AI INSIGHT</div>
                        <div class="insight-text">${t.insight}</div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </body>
    </html>
    `;
}

module.exports = { generateEmailTemplate, generateIndexHtml };
