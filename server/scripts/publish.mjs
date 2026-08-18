// 发布公告到线上。
// 用法:
//   1. 编辑 server/announcements.json（数组，最新的放最前）
//   2. npm run publish -- <令牌>
//      或 ANNOUNCE_TOKEN=<令牌> npm run publish
const token = process.argv[2] || process.env.ANNOUNCE_TOKEN

if (!token) {
  console.error('缺少令牌：npm run publish -- <令牌>')
  process.exit(1)
}

const { readFileSync } = await import('node:fs')
const announcements = JSON.parse(
  readFileSync(new URL('../announcements.json', import.meta.url), 'utf8')
)

const res = await fetch('https://api.f1-guess.online/announcements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, announcements }),
})

console.log(res.status === 200 ? '发布成功' : `发布失败: ${res.status} ${await res.text()}`)
