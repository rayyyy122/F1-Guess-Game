import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOnlineGame } from '../hooks/useOnlineGame'
import { LobbyView } from '../components/online/LobbyView'
import { RoomWaitView } from '../components/online/RoomWaitView'
import { OnlineGameView } from '../components/online/OnlineGameView'
import { ResultModal } from '../components/online/ResultModal'
import { ChangeNameModal } from '../components/online/ChangeNameModal'
import { getDriverById } from '../utils/drivers'
import { drivers } from '../utils/drivers'

export function OnlinePage() {
  const {
    phase,
    roomId,
    playerName,
    opponentName,
    myGuesses,
    opponentGuessCount,
    opponentLatestFeedback,
    remainingTime,
    result,
    targetDriverId,
    error,
    restartInvite,
    createRoom,
    joinRoom,
    makeGuess,
    giveUp,
    requestRestart,
    acceptRestart,
    declineRestart,
    leaveRoom,
    changePlayerName,
  } = useOnlineGame()

  const [showChangeNameModal, setShowChangeNameModal] = useState(false)

  const targetDriver = targetDriverId ? (getDriverById(targetDriverId) ?? null) : null

  const handleChangeName = (newName: string) => {
    changePlayerName(newName)
    setShowChangeNameModal(false)
  }

  return (
    <div className="min-h-screen bg-f1-dark text-f1-text">
      <header className="w-full border-b border-gray-700 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-2xl font-bold text-f1-red">F1</span>
            <span className="text-xl font-bold">GUESS</span>
          </Link>
          <Link
            to="/"
            className="px-4 py-2 bg-f1-gray hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            返回首页
          </Link>
        </div>
      </header>

      <main className="px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">联机模式</h1>
          <p className="text-gray-400">1v1 实时对战，2 分钟内分出胜负</p>
        </div>

        {phase === 'lobby' && (
          <LobbyView
            playerName={playerName}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onChangeName={() => setShowChangeNameModal(true)}
            error={error}
          />
        )}

        {phase === 'waiting' && roomId && (
          <RoomWaitView roomId={roomId} playerName={playerName} opponentName={opponentName} />
        )}

        {phase === 'playing' && (
          <OnlineGameView
            myGuesses={myGuesses}
            opponentGuessCount={opponentGuessCount}
            opponentLatestFeedback={opponentLatestFeedback}
            remainingTime={remainingTime}
            playerName={playerName}
            opponentName={opponentName}
            onGuess={makeGuess}
            onGiveUp={giveUp}
          />
        )}

        {phase === 'finished' && (
          <ResultModal
            isOpen
            result={result}
            yourGuesses={myGuesses.length}
            opponentGuesses={opponentGuessCount}
            targetDriver={targetDriver}
            opponentName={opponentName}
            restartInvite={restartInvite}
            onRequestRestart={requestRestart}
            onAcceptRestart={acceptRestart}
            onDeclineRestart={declineRestart}
            onBackToLobby={leaveRoom}
          />
        )}
      </main>

      <footer className="w-full py-4 text-center text-xs text-gray-500">
        数据截止到 2026-07-27，匈牙利大奖赛，共 {drivers.length} 名车手
      </footer>

      <ChangeNameModal
        isOpen={showChangeNameModal}
        currentName={playerName}
        onClose={() => setShowChangeNameModal(false)}
        onSave={handleChangeName}
      />
    </div>
  )
}
