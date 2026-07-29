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
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-f1-gray rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">游戏规则</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold mb-2 text-f1-red">玩法</h3>
            <p className="text-gray-300">
              系统会随机选择一位 F1 车手（现役或传奇），你需要在 <strong className="text-f1-red">8 次机会</strong> 内猜出答案。
              每次猜测后，系统会用颜色提示你与目标的接近程度。
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3 text-f1-red">颜色含义</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">🟩</span>
                <span>正确 - 属性完全匹配</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">🟨</span>
                <span>接近 - 属性相近（数值差距小或同一大洲）</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">⬜</span>
                <span>错误 - 属性不匹配</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-3 text-f1-red">反馈规则</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 pr-4">属性</th>
                    <th className="text-left py-2 pr-4 text-f1-green">🟩 正确</th>
                    <th className="text-left py-2 pr-4 text-f1-yellow">🟨 接近</th>
                    <th className="text-left py-2">⬜ 错误</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.label} className="border-b border-gray-700">
                      <td className="py-2 pr-4 font-medium">{rule.label}</td>
                      <td className="py-2 pr-4 text-gray-300">{rule.correct}</td>
                      <td className="py-2 pr-4 text-gray-300">{rule.close}</td>
                      <td className="py-2 text-gray-300">{rule.wrong}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 text-f1-red">提示</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>最多可以猜 8 次，猜对即获胜</li>
              <li>不能重复猜测同一位车手</li>
              <li>数值旁的 ↑ ↓ 表示目标值比你猜的更大或更小</li>
              <li>连胜纪录和最佳成绩会被记录</li>
              <li>点击"新游戏"可以随时开始下一局</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold mb-2 text-f1-red">车队说明</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>
                <strong>现役车手</strong>：显示当前效力车队
              </li>
              <li>
                <strong>储备车手</strong>：显示最后效力车队
                <span className="text-gray-400 text-sm">（如周冠宇现为法拉利储备，但显示索伯）</span>
              </li>
              <li>
                <strong>退役车手</strong>：显示最后效力车队
                <span className="text-gray-400 text-sm">（如舒马赫显示梅赛德斯，而非法拉利）</span>
              </li>
            </ul>
          </section>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
        >
          开始游戏
        </button>
      </div>
    </div>
  )
}
