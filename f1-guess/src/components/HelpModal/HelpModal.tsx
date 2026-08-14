import { useEffect } from 'react'

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

const rules = [
  { label: '国籍', correct: '相同', close: '同一大洲', wrong: '不同大洲' },
  { label: '车队', correct: '相同', close: '-', wrong: '不同' },
  { label: '车号', correct: '相同', close: '相差 ≤1', wrong: '相差 >1' },
  { label: '世界冠军', correct: '相同', close: '相差 ≤1', wrong: '相差 >1' },
  { label: '领奖台', correct: '相同', close: '相差 ≤1', wrong: '相差 >1' },
  { label: '分站冠军', correct: '相同', close: '相差 ≤1', wrong: '相差 >1' },
  { label: '首秀年份', correct: '相同', close: '相差 ≤1 年', wrong: '相差 >1 年' },
  { label: '状态', correct: '相同 (现役/储备/退役)', close: '-', wrong: '不同' },
]

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-overlay"
      onClick={onClose}
    >
      <div
        className="bg-f1-card rounded-xl p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">游戏规则</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-300 mb-4">
          系统随机选择一位 F1 车手，你需要在 <strong className="text-f1-red">8 次机会</strong>内猜出答案，每次猜测后系统会用颜色提示接近程度。
        </p>

        <div className="grid sm:grid-cols-[1fr_1.4fr] gap-5">
          {/* 左栏：颜色含义 + 车队说明 */}
          <div className="space-y-4">
            <section>
              <h3 className="text-sm font-bold mb-2 text-f1-red">颜色含义</h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-f1-green shrink-0" />
                  <span>正确 - 属性完全匹配</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-f1-yellow shrink-0" />
                  <span>接近 - 属性相近</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-f1-gray shrink-0" />
                  <span>错误 - 属性不匹配</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold mb-2 text-f1-red">车队说明</h3>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li><strong>现役</strong>：显示当前效力车队</li>
                <li>
                  <strong>储备</strong>：显示当前所属车队
                  <span className="text-gray-500">（周冠宇 → 凯迪拉克）</span>
                </li>
                <li>
                  <strong>退役</strong>：显示最后效力车队
                  <span className="text-gray-500">（舒马赫 → 梅赛德斯）</span>
                </li>
              </ul>
            </section>
          </div>

          {/* 右栏：反馈规则表 */}
          <section>
            <h3 className="text-sm font-bold mb-2 text-f1-red">反馈规则</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/15">
                  <th className="text-left py-1.5 pr-2">属性</th>
                  <th className="text-left py-1.5 pr-2">
                    <span className="inline-flex items-center gap-1 text-f1-green">
                      <span className="w-3 h-3 rounded-sm bg-f1-green" />
                      正确
                    </span>
                  </th>
                  <th className="text-left py-1.5 pr-2">
                    <span className="inline-flex items-center gap-1 text-f1-yellow">
                      <span className="w-3 h-3 rounded-sm bg-f1-yellow" />
                      接近
                    </span>
                  </th>
                  <th className="text-left py-1.5">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 rounded-sm bg-f1-gray" />
                      错误
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.label} className="border-b border-white/10">
                    <td className="py-1.5 pr-2 font-medium">{rule.label}</td>
                    <td className="py-1.5 pr-2 text-gray-300">{rule.correct}</td>
                    <td className="py-1.5 pr-2 text-gray-300">{rule.close}</td>
                    <td className="py-1.5 text-gray-300">{rule.wrong}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          不可重复猜测 · ↑↓ 表示目标值更大/更小 · 战绩自动记录
        </p>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 btn-primary"
        >
          开始游戏
        </button>
      </div>
    </div>
  )
}
