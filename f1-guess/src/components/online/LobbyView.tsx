import { useState } from 'react'

interface LobbyViewProps {
  onCreateRoom: (playerName: string) => void
  onJoinRoom: (roomId: string, playerName: string) => void
  error: string | null
}

export function LobbyView({ onCreateRoom, onJoinRoom, error }: LobbyViewProps) {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.trim())
    }
  }

  const handleJoinRoom = () => {
    if (playerName.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), playerName.trim())
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">你的名字</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="输入昵称"
          maxLength={20}
          className="w-full px-4 py-3 rounded-lg bg-f1-gray text-f1-text placeholder-gray-400 border-2 border-transparent focus:border-f1-red focus:outline-none"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-f1-red/20 border border-f1-red rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleCreateRoom}
        disabled={!playerName.trim()}
        className="w-full py-3 mb-6 bg-f1-red hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
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
        disabled={!playerName.trim() || roomId.length !== 6}
        className="w-full py-3 bg-f1-green text-f1-dark hover:bg-green-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
      >
        加入房间
      </button>
    </div>
  )
}
