export function RulesHint() {
  return (
    <div className="mt-3 flex items-center justify-center gap-x-4 gap-y-1 flex-wrap text-xs text-gray-400">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-f1-green" />
        完全匹配
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-f1-yellow" />
        接近
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-f1-gray" />
        不匹配
      </span>
      <span className="text-gray-600">|</span>
      <span className="inline-flex items-center gap-1">
        <span className="text-f1-text">↑</span>
        目标值更大
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="text-f1-text">↓</span>
        目标值更小
      </span>
    </div>
  )
}
