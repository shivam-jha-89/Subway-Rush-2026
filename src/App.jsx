import { useRef, useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { INITIAL_SPEED, COYOTE_TIME } from './game/constants'
import { createInitialGameState } from './game/state'
import { resetSpawnState } from './game/systems/spawning'
import { useControls } from './hooks'
import { ScoreOverlay, NearMissFlash, LoaderScreen } from './components/ui'
import { GameScene } from './components/three'

// screen: 'loading' | 'game'
export default function App() {
  const [screen, setScreen]   = useState('loading')
  const [countdown, setCountdown] = useState(null)
  const [score, setScore]     = useState(0)
  const [coins, setCoins]     = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [nearMiss, setNearMiss] = useState(0)

  const gameState = useRef(createInitialGameState())

  const handleNearMiss = useCallback((intensity) => {
    setNearMiss(intensity)
    setTimeout(() => setNearMiss(0), 150)
  }, [])

  const handleCoinCollect = useCallback(() => {
    gameState.current.coins++
    setCoins(c => c + 1)
  }, [])

  const handleCollision = useCallback(() => {
    if (gameState.current.gameOver) return  // prevent double-fire
    gameState.current.gameOver = true
    // Freeze player in place — stop all physics so they don't slide into the train
    gameState.current.isJumping = false
    gameState.current.jumpVelocity = 0
    gameState.current.isSliding = false
    gameState.current.slideTimer = 0
    gameState.current.speed = 0
    setGameOver(true)
    setScore(gameState.current.score)
  }, [])

  const handleRestart = useCallback(() => {
    resetSpawnState()
    gameState.current = {
      ...createInitialGameState(),
      started: true,
      wasOnGround: true,
      coyoteTimer: COYOTE_TIME,
    }
    setScore(0); setCoins(0); setGameOver(false)
  }, [])

  const startGame = useCallback(async () => {
    setCountdown(3)
    await new Promise(r => setTimeout(r, 1000))
    setCountdown(2)
    await new Promise(r => setTimeout(r, 1000))
    setCountdown(1)
    await new Promise(r => setTimeout(r, 1000))
    setCountdown(null)
    resetSpawnState()
    gameState.current.started     = true
    gameState.current.gameOver    = false
    gameState.current.score       = 0
    gameState.current.coins       = 0
    gameState.current.playerLane  = 0
    gameState.current.speed       = INITIAL_SPEED
    gameState.current.onTrain     = false
    // Reset all physics state so the player never starts airborne
    gameState.current.jumpHeight      = 0
    gameState.current.isJumping       = false
    gameState.current.jumpVelocity    = 0
    gameState.current.physicsAccumulator = 0
    gameState.current.coyoteTimer     = COYOTE_TIME
    gameState.current.jumpBufferTimer = 0
    gameState.current.wasOnGround     = true
    gameState.current.nearMiss        = 0
    gameState.current.trainRoofY      = 0
    gameState.current.isSliding       = false
    gameState.current.slideTimer      = 0
    setScore(0); setCoins(0); setGameOver(false)
  }, [])

  const handleCharSelected = useCallback(() => {
    setScreen('game')
    startGame()
  }, [startGame])

  useControls(gameState, handleRestart)

  useEffect(() => {
    const iv = setInterval(() => {
      if (gameState.current.started && !gameState.current.gameOver)
        setScore(gameState.current.score)
    }, 200)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{ touchAction:'none', position:'fixed', inset:0, background:'#000' }}>

      {/* Canvas always mounted so it's warmed up before countdown */}
      <Canvas
        style={{ width:'100%', height:'100%', visibility: screen === 'game' ? 'visible' : 'hidden' }}
        camera={{ fov:75, near:0.1, far:1000 }}
        dpr={[1, 1.2]}
        gl={{ antialias:true, powerPreference:'high-performance' }}
        frameloop="always"
      >
        <GameScene
          gameState={gameState}
          onCollision={handleCollision}
          onCoinCollect={handleCoinCollect}
          onNearMiss={handleNearMiss}
        />
      </Canvas>

      {screen === 'loading' && (
        <LoaderScreen onDone={() => { setScreen('game'); startGame() }} />
      )}

      {screen === 'game' && (
        <>
          <ScoreOverlay score={score} coins={coins} gameOver={gameOver} onRestart={handleRestart} />
          {!gameOver && <NearMissFlash intensity={nearMiss} />}

          {countdown !== null && (
            <div style={{
              position:'absolute', inset:0, display:'flex',
              alignItems:'center', justifyContent:'center',
              background:'rgba(0,0,0,0.7)', zIndex:50,
            }}>
              <div style={{
                color:'#fff',
                fontFamily:'Impact, "Arial Black", sans-serif',
                fontSize:120, letterSpacing:'-5px',
                textShadow:'0 0 60px rgba(255,255,255,0.3)',
                animation:'countPulse 1s ease-out',
              }}>
                {countdown}
              </div>
              <style>{`
                @keyframes countPulse {
                  0%  { transform:scale(1.5); opacity:0; }
                  20% { transform:scale(1);   opacity:1; }
                  80% { opacity:1; }
                  100%{ transform:scale(0.8); opacity:0; }
                }
              `}</style>
            </div>
          )}
        </>
      )}
    </div>
  )
}
