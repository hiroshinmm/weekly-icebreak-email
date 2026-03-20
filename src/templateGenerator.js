function generateEmailTemplate(topics, pageUrl) {
    return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px;">
        <header style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #003399; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Weekly Ice Break</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 8px;">エンジニアのための最新テックトレンド</p>
        </header>
        
        ${topics.map((t, i) => {
        const attachmentName = `news_image_${i}.png`;
        return `
            <div style="margin-bottom: 60px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
                <!-- Title Section -->
                <div style="padding: 32px 32px 24px 32px;">
                    <h2 style="margin: 0; font-size: 22px; line-height: 1.4; font-weight: 700;">
                        <a href="${t.link}" style="color: #1e293b; text-decoration: none;">${t.title}</a>
                    </h2>
                </div>
                
                <!-- Image Section -->
                <div style="width: 100%; aspect-ratio: 16/9; overflow: hidden; background-color: #f1f5f9; position: relative;">
                    <a href="${t.link}" style="display: block; width: 100%; height: 100%;">
                        <!-- Blurred Background for small/wide images -->
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('cid:${attachmentName}'); background-size: cover; background-position: center; filter: blur(20px); opacity: 0.3;"></div>
                        <img src="cid:${attachmentName}" alt="${t.title}" style="position: relative; width: 100%; height: 100%; display: block; object-fit: contain;">
                    </a>
                </div>
                
                <!-- Content Section -->
                <div style="padding: 24px 32px 32px 32px;">
                    <span style="display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #003399; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">${t.tag}</span>
                    <p style="font-size: 15px; color: #475569; line-height: 1.8; margin: 0 0 24px 0;">${t.snippet}</p>
                    
                    <!-- Insight Box -->
                    <div style="background-color: #f1f5f9; border-left: 4px solid #003399; padding: 20px; border-radius: 0 12px 12px 0;">
                        <div style="color: #003399; font-size: 12px; font-weight: 800; margin-bottom: 8px; letter-spacing: 1px;">💡 AI INSIGHT</div>
                        <div style="font-size: 14px; color: #334155; line-height: 1.7;">${t.insight}</div>
                    </div>
                </div>
            </div>
            `;
    }).join('')}
        
        <footer style="text-align: center; padding: 40px 0 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
            <p style="margin-bottom: 10px;">Weekly Ice Break Trends</p>
            <a href="${pageUrl}" style="color: #003399; text-decoration: none; font-weight: 600;">Webブラウザで全アーカイブを見る &rarr;</a>
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
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=Noto+Sans+JP:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
            :root {
                --accent: #003399;
                --text-main: #1e293b;
                --text-muted: #64748b;
                --bg: #f8fafc;
                --card-bg: #ffffff;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'Inter', 'Noto Sans JP', -apple-system, sans-serif;
                background: var(--bg);
                color: var(--text-main);
                line-height: 1.6;
                padding: 40px 20px;
            }
            header { text-align: center; padding: 60px 0; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 3rem; font-weight: 900; color: var(--accent); letter-spacing: -0.02em; margin-bottom: 12px; }
            header p { font-size: 1.1rem; color: var(--text-muted); }

            .cards { display: grid; grid-template-columns: 1fr; gap: 60px; max-width: 800px; margin: 0 auto; }
            .card {
                background: var(--card-bg);
                border-radius: 32px;
                overflow: hidden;
                box-shadow: 0 20px 50px rgba(0,0,0,0.06);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
                border: 1px solid rgba(0,0,0,0.02);
            }
            .card:hover {
                transform: translateY(-8px);
                box-shadow: 0 30px 60px rgba(0,0,0,0.1);
            }
            
            .card-header { padding: 40px 40px 24px 40px; }
            .card-title { font-size: 1.75rem; font-weight: 800; line-height: 1.4; }
            .card-title a { color: inherit; text-decoration: none; transition: color 0.2s; }
            .card-title a:hover { color: var(--accent); }

            .img-container { 
                width: 100%; 
                aspect-ratio: 16/9; 
                overflow: hidden; 
                background: #f8fafc; 
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .img-container img { 
                max-width: 100%; 
                max-height: 100%; 
                object-fit: contain; 
                transition: transform 0.5s ease; 
            }
            .card:hover .img-container img { transform: scale(1.03); }

            .card-body { padding: 32px 40px 40px 40px; }
            .tag {
                display: inline-block;
                background: #e0e7ff;
                color: var(--accent);
                font-size: 0.75rem;
                font-weight: 800;
                padding: 6px 14px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .card-snippet { font-size: 1.05rem; line-height: 1.8; color: #475569; margin-bottom: 32px; }

            .insight-box {
                background: #f1f5f9;
                border-left: 6px solid var(--accent);
                padding: 24px 30px;
                border-radius: 0 20px 20px 0;
            }
            .insight-label { font-size: 0.8rem; font-weight: 900; color: var(--accent); margin-bottom: 10px; letter-spacing: 0.1em; }
            .insight-text { font-size: 1rem; line-height: 1.8; color: #334155; }

            @media (max-width: 600px) {
                h1 { font-size: 2.2rem; }
                .card-header { padding: 32px 24px 20px 24px; }
                .card-title { font-size: 1.4rem; }
                .card-body { padding: 24px 24px 32px 24px; }
                .insight-box { padding: 20px 24px; }
            }
        </style>
    </head>
    <body>
        <header>
            <h1>Weekly Ice Break</h1>
            <p>エンジニアのための最新テックトレンド</p>
        </header>
        <div class="cards">
            ${topics.map((t, i) => `
            <article class="card">
                <div class="card-header">
                    <h2 class="card-title"><a href="${t.link}" target="_blank">${t.title}</a></h2>
                </div>
                <div class="img-container">
                    <a href="${t.link}" target="_blank" style="display: block; width: 100%; height: 100%; position: relative;">
                        <!-- Blurred background effect -->
                        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('output/news_image_${i}.png'); background-size: cover; background-position: center; filter: blur(15px); opacity: 0.3; transform: scale(1.1);"></div>
                        <img src="output/news_image_${i}.png" alt="${t.title}" loading="lazy" style="position: relative; z-index: 1;">
                    </a>
                </div>
                <div class="card-body">
                    <div class="tag">${t.tag}</div>
                    <p class="card-snippet">${t.snippet}</p>
                    <div class="insight-box">
                        <div class="insight-label">💡 AI INSIGHT</div>
                        <div class="insight-text">${t.insight}</div>
                    </div>
                </div>
            </article>
            `).join('')}
        </div>
        <footer style="text-align: center; margin-top: 80px; color: var(--text-muted); font-size: 0.9rem;">
            &copy; 2026 Weekly Ice Break Trends
        </footer>
    </body>
    </html>
    `;
}

module.exports = { generateEmailTemplate, generateIndexHtml };
