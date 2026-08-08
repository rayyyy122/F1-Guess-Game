import { drivers } from '../utils/drivers'

function BilibiliIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M8.5 3l2.5 3.5M15.5 3L13 6.5" strokeLinecap="round" />
      <path d="M9.5 12v3M14.5 12v3" strokeLinecap="round" />
    </svg>
  )
}

function XiaohongshuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF2442" />
      <path
        d="M7 8.5h10M7 12h10M7 15.5h6"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

const linkClass =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-f1-card border border-white/10 text-gray-300 hover:text-white hover:border-f1-red hover:-translate-y-0.5 hover:shadow-lg hover:shadow-f1-red/20 transition-all'

export function Footer() {
  return (
    <footer className="w-full py-4 text-center text-xs text-gray-500">
      <p>数据截止到 2026-07-27，匈牙利大奖赛，共 {drivers.length} 名车手</p>
      <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
        <span>遇到问题或建议？来找我反馈</span>
        <a
          href="https://www.xiaohongshu.com/user/profile/6069da3e000000000100ba58"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <XiaohongshuIcon />
          小红书
        </a>
        <a
          href="https://space.bilibili.com/142025389"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <BilibiliIcon />
          bilibili
        </a>
      </div>
    </footer>
  )
}
