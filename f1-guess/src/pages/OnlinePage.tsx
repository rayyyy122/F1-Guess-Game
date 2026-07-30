import { Link } from 'react-router-dom'

export function OnlinePage() {
  return (
    <div className="min-h-screen bg-f1-dark text-f1-text flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🚧</div>
        <h1 className="text-3xl font-bold mb-4">联机模式</h1>
        <p className="text-gray-400 mb-8">正在开发中，敬请期待...</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}
