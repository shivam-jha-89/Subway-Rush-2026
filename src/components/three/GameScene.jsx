import { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OBSTACLE_SPAWN_INTERVAL, COIN_SPAWN_INTERVAL, INITIAL_SPEED, MAX_SPEED_INCREASE, SPEED_RAMP_DISTANCE, LANES, TRAIN_VARIANTS, TRAIN_CAR_GAP } from '../../game/constants'
import { updateJumpPhysics, updateSlide } from '../../game/systems/physics'
import { checkTrainCollision, checkBarrierCollision, checkCoinCollection } from '../../game/systems/collision'
import { spawnObstacles, spawnCoins, resetSpawnState } from '../../game/systems/spawning'
import { Player } from './Player'
import { Train } from './Train'
import { Barrier } from './Barrier'
import { Coin } from './Coin'
import { TrainTracks } from './TrainTracks'
import { ScrollingWalls } from './ScrollingWalls'
import { Effects } from './Effects'

export function GameScene({ gameState, onCollision, onCoinCollect, onNearMiss }) {
  const { camera } = useThree()
  const obstaclesRef = useRef([])
  const coinsRef = useRef([])
  const lastSpawnZ = useRef(-80)
  const lastCoinZ = useRef(-50)
  const worldZ = useRef(0)
  const cameraY = useRef(4.5)
  const cameraX = useRef(0)
  const wasGameOver = useRef(false)
  const [, forceRender] = useState(0)

  const lastRenderTime = useRef(0)

  useEffect(() => {
    camera.position.set(0, 5.0, 10)
    camera.rotation.x = -0.18
  }, [camera])

  useFrame((state, delta) => {
    // ── Reset detection (merged from second useFrame) ──
    const isGameOver = gameState.current.gameOver
    const isStarted  = gameState.current.started
    if (wasGameOver.current && isStarted && !isGameOver) {
      obstaclesRef.current = []
      coinsRef.current     = []
      lastSpawnZ.current   = -80
      lastCoinZ.current    = -50
      worldZ.current       = 0
      cameraY.current      = 4.5
      cameraX.current      = 0
      resetSpawnState()
      forceRender(n => n + 1)
    }
    wasGameOver.current = isGameOver
    if (!isStarted || isGameOver) return

    // ── Physics ──
    updateJumpPhysics(gameState.current, delta)
    updateSlide(gameState.current, delta)

    const playerY    = gameState.current.jumpHeight || 0
    const playerLane = gameState.current.playerLane
    const playerX    = LANES[playerLane + 1]

    // ── Camera (no lookAt — direct rotation write) ──
    cameraX.current += (playerX * 0.55 - cameraX.current) * 0.10
    camera.position.x = cameraX.current

    const speed      = gameState.current.speed
    const moveAmount = Math.min(speed * delta, speed * 0.05)

    // ── Single obstacle loop: camera raise + collision + move + mesh update ──
    const obstacles = obstaclesRef.current
    let obstacleRaise = 0
    let stillOnTrain  = false
    let needsRender   = false

    for (let i = 0; i < obstacles.length; i++) {
      const obs      = obstacles[i]
      const distAhead = -obs.z

      // Camera raise scan (only for obstacles ahead and close)
      if (distAhead > 0 && distAhead < 35) {
        const prox = 1 - distAhead / 35
        if (obs.type === 'train') {
          const h = (TRAIN_VARIANTS[obs.variant] || TRAIN_VARIANTS.normal).height
          obstacleRaise = Math.max(obstacleRaise, (h + 0.9) * 0.55 * prox)
        } else {
          obstacleRaise = Math.max(obstacleRaise, 0.6 * prox)
        }
      }

      // Collision + movement
      if (obs.type === 'train') {
        const result = checkTrainCollision(gameState.current, obs, moveAmount)
        if (result.hit && !gameState.current.gameOver) {
          const dims = TRAIN_VARIANTS[obs.variant] || TRAIN_VARIANTS.normal
          obs.z = -(dims.length / 2) - 1.5
          onCollision()
        } else {
          obs.z += obs.oncoming ? moveAmount * 2.2 : moveAmount
        }
        if (result.onRoof) {
          stillOnTrain = true
          gameState.current.onTrain    = true
          gameState.current.trainId    = obs.id
          gameState.current.trainRoofY = result.roofY
          if (!gameState.current.isJumping) {
            gameState.current.jumpHeight   = result.roofY
            gameState.current.jumpVelocity = 0
          }
        }
      } else {
        obs.z += moveAmount
        const result = checkBarrierCollision(gameState.current, obs)
        if (result.hit && !gameState.current.gameOver) onCollision()
      }

      // Mesh position update (no per-component useFrame)
      if (obs._mesh?.current) {
        const mesh = obs._mesh.current
        if (obs.type === 'train') {
          const H = (TRAIN_VARIANTS[obs.variant] || TRAIN_VARIANTS.normal).height
          mesh.position.x = LANES[obs.lane + 1]
          mesh.position.y = H / 2 + 0.9
          mesh.position.z = obs.z
          mesh.rotation.y = obs.oncoming ? Math.PI : 0
        } else {
          mesh.position.x = LANES[obs.lane + 1]
          mesh.position.y = 1.08
          mesh.position.z = obs.z
        }
      }
    }

    // ── Camera Y ──
    const targetCamY = 5.0 + playerY * 0.55 + obstacleRaise
    cameraY.current += (targetCamY - cameraY.current) * 0.08
    camera.position.y = cameraY.current
    camera.rotation.x = -0.18 - obstacleRaise * 0.02 - playerY * 0.01

    // ── Speed / worldZ ──
    worldZ.current += moveAmount
    gameState.current.speed = INITIAL_SPEED + MAX_SPEED_INCREASE * Math.min(1, worldZ.current / SPEED_RAMP_DISTANCE)

    // Floating-point renormalise
    if (worldZ.current > 5000) {
      const sh = 4000
      worldZ.current     -= sh
      lastSpawnZ.current -= sh
      lastCoinZ.current  -= sh
      for (let i = 0; i < obstacles.length; i++) obstacles[i].z += sh
      const cns = coinsRef.current
      for (let i = 0; i < cns.length; i++) cns[i].z += sh
    }

    // ── Spawning ──
    if (worldZ.current - lastSpawnZ.current > OBSTACLE_SPAWN_INTERVAL) {
      lastSpawnZ.current = worldZ.current
      spawnObstacles(obstaclesRef.current, worldZ.current)
      needsRender = true
    }
    if (worldZ.current - lastCoinZ.current > COIN_SPAWN_INTERVAL) {
      lastCoinZ.current = worldZ.current
      spawnCoins(coinsRef.current, obstaclesRef.current, worldZ.current)
      needsRender = true
    }

    // ── In-place obstacle cull — no forceRender needed, mesh becomes invisible naturally ──
    let oi = 0
    while (oi < obstaclesRef.current.length) {
      const obs    = obstaclesRef.current[oi]
      const carLen = obs.type === 'train' ? (TRAIN_VARIANTS[obs.variant] || TRAIN_VARIANTS.normal).length : 0
      const rear   = obs.z - (obs.numCars || 1) * (carLen + TRAIN_CAR_GAP)
      const keep   = obs.type === 'train' ? rear < 60 : obs.z < 20
      if (!keep) {
        // Hide mesh immediately before removing from array
        if (obs._mesh?.current) obs._mesh.current.visible = false
        obstaclesRef.current[oi] = obstaclesRef.current[obstaclesRef.current.length - 1]
        obstaclesRef.current.pop()
      } else { oi++ }
    }

    if (!stillOnTrain && gameState.current.onTrain) {
      gameState.current.onTrain    = false
      gameState.current.trainRoofY = 0
    }

    if (gameState.current.nearMiss > 0) {
      onNearMiss(gameState.current.nearMiss)
      gameState.current.nearMiss = 0
    }

    // ── Coins ──
    const t    = state.clock.elapsedTime
    const coins = coinsRef.current
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i]
      coin.z += moveAmount
      if (checkCoinCollection(gameState.current, coin)) {
        coin.collected = true
        onCoinCollect()
      }
      if (coin._mesh?.current) {
        coin._mesh.current.position.x = LANES[coin.lane + 1]
        coin._mesh.current.position.y = coin.y
        coin._mesh.current.position.z = coin.z
        coin._mesh.current.visible    = !coin.collected
        if (!coin.collected) coin._mesh.current.rotation.y = t * 3.5
      }
    }

    // ── In-place coin cull — no forceRender, mesh hidden immediately ──
    let ci = 0
    while (ci < coinsRef.current.length) {
      if (coinsRef.current[ci].z < 15) { ci++ }
      else {
        const dead = coinsRef.current[ci]
        if (dead._mesh?.current) dead._mesh.current.visible = false
        coinsRef.current[ci] = coinsRef.current[coinsRef.current.length - 1]
        coinsRef.current.pop()
      }
    }

    gameState.current.score = Math.floor(worldZ.current)

    if (needsRender) {
      const now = state.clock.elapsedTime
      if (now - lastRenderTime.current > 0.6) {
        lastRenderTime.current = now
        forceRender(n => n + 1)
      }
    }
  })

  return (
    <>
      <color attach="background" args={['#1A1240']} />
      <fog attach="fog" args={['#1A1240', 60, 160]} />

      <TrainTracks scrollOffset={worldZ} visible={true} />
      <ScrollingWalls scrollOffset={worldZ} gameState={gameState} />
      <Player gameState={gameState} />

      {obstaclesRef.current.map(obs => {
        if (obs.type === 'train') {
          return (
            <Train
              key={obs.id}
              obstacleRef={obs}
              numCars={obs.numCars}
              variant={obs.variant}
            />
          )
        } else {
          return (
            <Barrier
              key={obs.id}
              obstacleRef={obs}
            />
          )
        }
      })}

      {coinsRef.current.map(coin => (
        <Coin
          key={coin.id}
          coinRef={coin}
        />
      ))}

      <Effects />
    </>
  )
}
