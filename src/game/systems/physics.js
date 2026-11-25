import {
  GRAVITY_UP,
  GRAVITY_DOWN,
  TRAIN_ROOF_Y,
  COYOTE_TIME,
  JUMP_BUFFER_TIME,
  JUMP_VELOCITY,
} from '../constants'

// Direct delta physics — no fixed timestep accumulator
// Simple, fast, no race condition with keyboard events

export function updateJumpPhysics(gameState, delta) {
  const dt = Math.min(delta, 0.05) // cap at 50ms to prevent huge jumps on tab switch
  const floorLevel = gameState.onTrain ? gameState.trainRoofY || TRAIN_ROOF_Y : 0

  // Drain jump buffer timer
  if (gameState.jumpBufferTimer > 0) {
    gameState.jumpBufferTimer -= dt
    if (gameState.jumpBufferTimer < 0) gameState.jumpBufferTimer = 0
  }

  // Drain coyote timer when airborne
  const isOnGround = !gameState.isJumping && gameState.jumpHeight <= floorLevel + 0.01
  if (isOnGround) {
    gameState.coyoteTimer = COYOTE_TIME
    gameState.wasOnGround = true
    gameState.jumpHeight  = floorLevel
    // Buffered jump fires on landing
    if (gameState.jumpBufferTimer > 0) {
      gameState.isJumping       = true
      gameState.jumpVelocity    = JUMP_VELOCITY
      gameState.jumpBufferTimer = 0
    }
  } else {
    if (gameState.coyoteTimer > 0) gameState.coyoteTimer -= dt
  }

  // Integrate jump
  if (gameState.isJumping) {
    const gravity = gameState.jumpVelocity > 0 ? GRAVITY_UP : GRAVITY_DOWN
    gameState.jumpVelocity -= gravity * dt
    gameState.jumpHeight   += gameState.jumpVelocity * dt

    if (gameState.jumpHeight <= floorLevel) {
      gameState.jumpHeight   = floorLevel
      gameState.isJumping    = false
      gameState.jumpVelocity = 0
      gameState.coyoteTimer  = COYOTE_TIME
      gameState.wasOnGround  = true
      // Buffered jump: fire immediately on landing
      if (gameState.jumpBufferTimer > 0) {
        gameState.isJumping       = true
        gameState.jumpVelocity    = JUMP_VELOCITY
        gameState.jumpBufferTimer = -1   // sentinel — prevents isOnGround block from re-firing
      }
    }
  } else if (!isOnGround) {
    // Fell off platform
    if (gameState.jumpVelocity > 0) gameState.jumpVelocity = 0
    gameState.jumpVelocity -= GRAVITY_DOWN * dt
    gameState.jumpHeight   += gameState.jumpVelocity * dt
    if (gameState.jumpHeight <= floorLevel) {
      gameState.jumpHeight   = floorLevel
      gameState.jumpVelocity = 0
      gameState.coyoteTimer  = COYOTE_TIME
      gameState.wasOnGround  = true
    }
  }
}

export function tryJump(gameState) {
  if (gameState.isJumping) {
    // Buffer the jump for when we land
    gameState.jumpBufferTimer = JUMP_BUFFER_TIME
    return false
  }

  const floorLevel = gameState.onTrain ? gameState.trainRoofY || TRAIN_ROOF_Y : 0
  const onGround   = gameState.jumpHeight <= floorLevel + 0.1
  const coyote     = gameState.coyoteTimer > 0

  if (onGround || coyote) {
    gameState.isJumping       = true
    gameState.jumpVelocity    = JUMP_VELOCITY
    gameState.jumpHeight      = floorLevel
    gameState.coyoteTimer     = 0
    gameState.jumpBufferTimer = 0
    gameState.wasOnGround     = false
    return true
  }

  // Buffer for landing
  gameState.jumpBufferTimer = JUMP_BUFFER_TIME
  return false
}

export function releaseJump(gameState) {
  // no-op — fixed height jump, no variable cut
}

const SLIDE_DURATION = 0.6

export function trySlide(gameState) {
  const floorLevel = gameState.onTrain ? gameState.trainRoofY || TRAIN_ROOF_Y : 0
  if (gameState.jumpHeight > floorLevel + 0.1) {
    // Mid-air: fast fall
    gameState.jumpVelocity = -20
    return
  }
  if (!gameState.isSliding) {
    gameState.isSliding  = true
    gameState.slideTimer = SLIDE_DURATION
  }
}

export function updateSlide(gameState, delta) {
  if (!gameState.isSliding) return
  gameState.slideTimer -= delta
  if (gameState.slideTimer <= 0) {
    gameState.isSliding  = false
    gameState.slideTimer = 0
  }
}
