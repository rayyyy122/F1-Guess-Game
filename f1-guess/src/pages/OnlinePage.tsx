import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnlineGame } from '../hooks/useOnlineGame'
import { Header } from '../components/Header/Header'
import { LobbyView } from '../components/online/LobbyView'
import { RoomWaitView } from '../components/online/RoomWaitView'
import { OnlineGameView } from '../components/online/OnlineGameView'
import { ResultModal } from '../components/online/ResultModal'
import { ChangeNameModal } from '../components/online/ChangeNameModal'
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal'
import { StatsModal } from '../components/StatsModal/StatsModal'
import { HelpModal } from '../components/HelpModal/HelpModal'
import { getDriverById } from '../utils/drivers'
import { Footer } from '../components/Footer'

export function OnlinePage() {
  const {
    phase,
    roomId,
    playerName,
    opponentName,
    myGuesses,
    opponentGuessCount,
    opponentGuesses,
    remainingTime,
    result,
    endReason,
    targetDriverId,
    mode,
    error,
    restartInvite,
    createRoom,
    joinRoom,
    makeGuess,
    giveUp,
    requestRestart,
    acceptRestart,
    leaveRoom,
    changePlayerName,
  } = useOnlineGame()

  const [showChangeNameModal, setShowChangeNameModal] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const navigate = useNavigate()

  // 返回首页前必须先走 leaveRoom 流程通知服务端，
  // 否则对方会卡在房间里等不到结算；
  // 对局未结束时先弹确认，避免误触直接退出房间
  const inActiveRoom =
    phase === 'waiting' || phase === 'playing' || phase === 'reconnecting'

  const handleBackToHome = () => {
    if (inActiveRoom) {
      setShowLeaveConfirm(true)
      return
    }
    leaveRoom()
    navigate('/')
  }

  const handleCloseHelp = () => {
    setIsHelpOpen(false)
  }

  const targetDriver = targetDriverId ? (getDriverById(targetDriverId) ?? null) : null

  const handleChangeName = (newName: string) => {
    changePlayerName(newName)
    setShowChangeNameModal(false)
  }

  return (
    <div className="min-h-screen text-f1-text">
      <Header
        onShowStats={() => setIsStatsOpen(true)}
        onShowHelp={() => setIsHelpOpen(true)}
        showNewGame={false}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-4">
          <button onClick={handleBackToHome} className="text-sm text-gray-400 hover:text-f1-red">
            ← 返回首页
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tight mb-2">联机模式</h1>
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

        {phase === 'reconnecting' && (
          <div className="text-center py-16 text-gray-400">正在恢复对局...</div>
        )}

        {phase === 'waiting' && roomId && (
          <RoomWaitView roomId={roomId} playerName={playerName} opponentName={opponentName} mode={mode} />
        )}

        {phase === 'playing' && (
          <OnlineGameView
            myGuesses={myGuesses}
            opponentGuessCount={opponentGuessCount}
            opponentGuesses={opponentGuesses}
            remainingTime={remainingTime}
            playerName={playerName}
            opponentName={opponentName}
            mode={mode}
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
            opponentLeft={endReason === 'opponent_disconnect'}
            restartInvite={restartInvite}
            onRequestRestart={requestRestart}
            onAcceptRestart={acceptRestart}
            onBackToLobby={leaveRoom}
          />
        )}
      </main>

      <Footer />

      <ChangeNameModal
        isOpen={showChangeNameModal}
        currentName={playerName}
        onClose={() => setShowChangeNameModal(false)}
        onSave={handleChangeName}
      />

      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={handleCloseHelp} />

      <ConfirmModal
        isOpen={showLeaveConfirm}
        title="退出房间？"
        message="返回首页将退出当前房间，对局会立即结束并判对手获胜。"
        confirmText="退出房间"
        cancelText="继续对局"
        danger
        onConfirm={() => {
          setShowLeaveConfirm(false)
          leaveRoom()
          navigate('/')
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />
    </div>
  )
}
