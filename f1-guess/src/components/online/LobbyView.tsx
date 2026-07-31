import { useState } from 'react'
import { User, Edit2 } from 'lucide-react'

interface LobbyViewProps {
  playerName: string
  onCreateRoom: (playerName: string) => void
  onJoinRoom: (roomId: string, playerName: string) => void
  onChangeName: () => void
  error: string | null
}

export function LobbyView({
  playerName,
  onCreateRoom,
  onJoinRoom,
  onChangeName,
  error,
}: LobbyViewProps) {
  const [roomId, setRoomId] = useState('')

  const handleCreateRoom = () => {
    onCreateRoom(playerName)
  }

  const handleJoinRoom = () => {
    if (roomId.trim() && roomId.length === 6) {
      onJoinRoom(roomId.trim().toUpperCase(), playerName)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* 当前昵称显示 */}
      <div className="mb-6 p-4 bg-f1-gray rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-f1-red rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400">你的昵称</p>
              <p className="font-medium">{playerName}</p>
            </div>
          </div>
          <button
            onClick={onChangeName}
            className="p-2 hover:bg-f1-dark rounded-lg transition-colors"
            title="修改昵称"
          >
            <Edit2 size={18} className="text-gray-400 hover:text-f1-red" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-f1-red/20 border border-f1-red rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleCreateRoom}
        className="w-full py-3 mb-6 bg-f1-red hover:bg-red-700 rounded-lg font-medium transition-colors"
      >
        创建新房间
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-f1-dark text-gray-400">或</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">房间号</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          placeholder="输入 6 位字母房间号"
          maxLength={6}
          className="w-full px-4 py-3 rounded-lg bg-f1-gray text-f1-text placeholder-gray-400 border-2 border-transparent focus:border-f1-red focus:outline-none uppercase tracking-widest text-center text-lg font-mono"
        />
      </div>

      <button
        onClick={handleJoinRoom}
        disabled={roomId.length !== 6}
        className="w-full py-3 bg-f1-green text-f1-dark hover:bg-green-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        加入房间
      </button>
    </div>
  )
}
