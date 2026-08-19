import type { GlobalStatsData } from './stats'

export function renderStatsPage(stats: GlobalStatsData): string {
  const updatedAt = new Date(stats.updatedAt).toLocaleString('zh-CN', { hour12: false })

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>F1 Guess 数据面板</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: #0F0F15;
      color: #F1F1F1;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 16px;
    }
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background: radial-gradient(ellipse 90% 45% at 50% -5%, rgba(225, 6, 0, 0.12), transparent 70%);
    }
    h1 { font-size: 28px; font-weight: 900; font-style: italic; letter-spacing: -0.02em; }
    h1 .red { color: #E10600; }
    .subtitle { color: #8b8b94; font-size: 14px; margin-top: 8px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      max-width: 900px;
      width: 100%;
      margin-top: 40px;
    }
    .card {
      background: #1D1D27;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 28px 20px;
      text-align: center;
    }
    .value {
      font-size: 44px;
      font-weight: 900;
      font-style: italic;
      color: #E10600;
      font-variant-numeric: tabular-nums;
    }
    .label { color: #8b8b94; font-size: 14px; margin-top: 8px; }
    .meta { color: #5b5b64; font-size: 12px; margin-top: 40px; }
    .meta a { color: #8b8b94; }
  </style>
</head>
<body>
  <h1><span class="red">Formula 1</span> Guess</h1>
  <p class="subtitle">联机模式数据面板</p>

  <div class="grid">
    <div class="card"><div class="value" id="roomsCreated">${stats.roomsCreated}</div><div class="label">创建房间</div></div>
    <div class="card"><div class="value" id="gamesStarted">${stats.gamesStarted}</div><div class="label">累计开局</div></div>
    <div class="card"><div class="value" id="gamesFinished">${stats.gamesFinished}</div><div class="label">累计完局</div></div>
    <div class="card"><div class="value" id="totalGuesses">${stats.totalGuesses}</div><div class="label">总猜测次数</div></div>
  </div>

  <p class="meta">
    更新于 <span id="updatedAt">${updatedAt}</span> · 每 60 秒自动刷新 ·
    <a href="https://f1-guess.online">f1-guess.online</a>
  </p>

  <script>
    async function refresh() {
      try {
        const res = await fetch('/stats')
        const data = await res.json()
        for (const key of ['roomsCreated', 'gamesStarted', 'gamesFinished', 'totalGuesses']) {
          document.getElementById(key).textContent = data[key]
        }
        document.getElementById('updatedAt').textContent =
          new Date(data.updatedAt).toLocaleString('zh-CN', { hour12: false })
      } catch {
        // 刷新失败静默，下次重试
      }
    }
    setInterval(refresh, 60000)
  </script>
</body>
</html>`
}
