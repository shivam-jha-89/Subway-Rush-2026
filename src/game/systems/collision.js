import {
  LANES, TRAIN_VARIANTS, TRAIN_CAR_GAP,
  LANE_COLLISION_TOLERANCE, Z_COLLISION_BUFFER,
  BARRIER_Z_BUFFER, COIN_COLLECT_RADIUS
} from '../constants'

// Reusable result objects — zero heap allocation per collision check
const _TR = { hit: false, onRoof: false, fellOff: false, roofY: 0 }
const _BR = { hit: false }

export function checkTrainCollision(gameState, obstacle, moveAmount = 0) {
  const playerLaneX = LANES[gameState.playerLane + 1]
  const playerY     = gameState.jumpHeight
  const obsLaneX    = LANES[obstacle.lane + 1]

  const dims          = TRAIN_VARIANTS[obstacle.variant] || TRAIN_VARIANTS.normal
  const trainCarLen   = dims.length
  const trainWidth    = dims.width
  const trainHeight   = dims.height
  const wheelOffset   = 0.9
  const trainLength   = obstacle.numCars * (trainCarLen + TRAIN_CAR_GAP)

  let trainFrontZ, trainBackZ
  if (obstacle.oncoming) {
    trainBackZ  = obstacle.z + trainCarLen / 2
    trainFrontZ = obstacle.z - trainLength + trainCarLen / 2
  } else {
    trainFrontZ = obstacle.z + trainCarLen / 2
    trainBackZ  = obstacle.z - trainLength + trainCarLen / 2
  }

  const laneDist        = Math.abs(playerLaneX - obsLaneX)
  const inLane          = laneDist < trainWidth / 2 + LANE_COLLISION_TOLERANCE
  const minZ            = trainFrontZ < trainBackZ ? trainFrontZ : trainBackZ
  const maxZ            = trainFrontZ > trainBackZ ? trainFrontZ : trainBackZ
  const inZRange        = 0 > minZ - Z_COLLISION_BUFFER && 0 < maxZ + Z_COLLISION_BUFFER
  const inCollisionZone = inLane && inZRange

  // Near-miss (same-direction only)
  if (!obstacle.oncoming && !inCollisionZone) {
    const nmt = trainWidth / 2 + 1.5
    if (laneDist < nmt && laneDist >= trainWidth / 2 && trainFrontZ > -2 && trainFrontZ < 3 && !obstacle.nearMissTriggered) {
      obstacle.nearMissTriggered = true
      gameState.nearMiss = Math.max(gameState.nearMiss, 1 - (laneDist - trainWidth / 2) / 1.5)
    }
  }

  const roofY = trainHeight + wheelOffset

  if (!inCollisionZone) {
    // fellOff only when player was on THIS specific train and it's no longer in range
    const fellOff = !obstacle.oncoming && gameState.onTrain && obstacle.id === gameState.trainId
    _TR.hit = false; _TR.onRoof = false; _TR.fellOff = fellOff; _TR.roofY = 0
    return _TR
  }
  if (obstacle.oncoming) {
    _TR.hit = true; _TR.onRoof = false; _TR.fellOff = false; _TR.roofY = 0
    return _TR
  }
  if (gameState.onTrain) {
    // Only stay on roof if this is the SAME train we're riding
    if (gameState.trainId === obstacle.id) {
      _TR.hit = false; _TR.onRoof = true; _TR.fellOff = false; _TR.roofY = roofY
      return _TR
    }
    // Different train — treat as normal ground collision
  }
  if (gameState.isJumping) {
    _TR.hit = false; _TR.onRoof = false; _TR.fellOff = false; _TR.roofY = 0
    return _TR
  }
  // Check if player is above the roof — land on top
  if (gameState.jumpHeight >= roofY - 0.5) {
    _TR.hit = false; _TR.onRoof = true; _TR.fellOff = false; _TR.roofY = roofY
    return _TR
  }
  _TR.hit = true; _TR.onRoof = false; _TR.fellOff = false; _TR.roofY = 0
  return _TR
}

export function checkBarrierCollision(gameState, obstacle) {
  const playerLaneX = LANES[gameState.playerLane + 1]
  const playerY     = gameState.jumpHeight
  const obsLaneX    = LANES[obstacle.lane + 1]

  const frontZ = obstacle.z + 0.5
  const backZ  = obstacle.z - 0.5
  const inLane   = Math.abs(playerLaneX - obsLaneX) < 1.8
  const inZRange = 0 > backZ - BARRIER_Z_BUFFER && 0 < frontZ + BARRIER_Z_BUFFER
  const BARRIER_TOP = 1.6
  const cleared = playerY >= BARRIER_TOP || gameState.isSliding

  if (inLane && inZRange && !obstacle.nearMissTriggered && playerY >= BARRIER_TOP && playerY < BARRIER_TOP + 0.4 && frontZ > -1 && frontZ < 2) {
    obstacle.nearMissTriggered = true
    gameState.nearMiss = Math.max(gameState.nearMiss, Math.max(0.3, 1 - (playerY - BARRIER_TOP) / 1.5))
  }

  _BR.hit = inLane && inZRange && !cleared
  return _BR
}

export function checkCoinCollection(gameState, coin) {
  if (coin.collected) return false
  const playerLaneX = LANES[gameState.playerLane + 1]
  const coinLaneX   = LANES[coin.lane + 1]
  return Math.abs(playerLaneX - coinLaneX) < COIN_COLLECT_RADIUS &&
         Math.abs(coin.z)                   < COIN_COLLECT_RADIUS &&
         Math.abs(coin.y - (gameState.jumpHeight + 0.9)) < 0.8
}
