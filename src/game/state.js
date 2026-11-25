import { INITIAL_SPEED } from './constants'

export function createInitialGameState() {
  return {
    playerLane: 0,
    jumpHeight: 0,
    isJumping: false,
    jumpVelocity: 0,
    onTrain: false,
    trainRoofY: 0,
    trainId: null,
    started: false,
    gameOver: false,
    score: 0,
    coins: 0,
    speed: INITIAL_SPEED,
    nearMiss: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    wasOnGround: true,
    jumpHeld: false,
    physicsAccumulator: 0,
    isSliding: false,
    slideTimer: 0,
  }
}
