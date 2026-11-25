import { useEffect } from 'react'
import { tryJump, releaseJump, trySlide } from '../game/systems/physics'

export function useControls(gameState, onRestart) {
  useEffect(() => {
    const keysPressed = new Set()
    let lastLaneChange = 0
    const LANE_CHANGE_COOLDOWN = 80
    const jumpKeys = ['ArrowUp', 'w', ' ']

    const handleKeyDown = (e) => {
      if (!gameState.current.started) return

      if (gameState.current.gameOver) {
        // Only intentional keys restart the game
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'r' || e.key === 'R') {
          onRestart()
        }
        return
      }

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault()
      }

      const now = Date.now()

      if ((e.key === 'ArrowLeft' || e.key === 'a') && gameState.current.playerLane > -1) {
        if (now - lastLaneChange > LANE_CHANGE_COOLDOWN) {
          gameState.current.playerLane--
          lastLaneChange = now
        }
      } else if ((e.key === 'ArrowRight' || e.key === 'd') && gameState.current.playerLane < 1) {
        if (now - lastLaneChange > LANE_CHANGE_COOLDOWN) {
          gameState.current.playerLane++
          lastLaneChange = now
        }
      } else if (jumpKeys.includes(e.key) && !keysPressed.has(e.key)) {
        tryJump(gameState.current)
      } else if ((e.key === 'ArrowDown' || e.key === 's') && !keysPressed.has(e.key)) {
        trySlide(gameState.current)
      }

      keysPressed.add(e.key)
    }

    const handleKeyUp = (e) => {
      keysPressed.delete(e.key)
      if (jumpKeys.includes(e.key)) {
        releaseJump(gameState.current)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, onRestart])

  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0
    let jumpTriggered = false
    let lastRestartTime = 0

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchStartTime = Date.now()
      jumpTriggered = false
    }

    const handleTouchMove = (e) => {
      if (!gameState.current.started || gameState.current.gameOver) return

      const dx = e.touches[0].clientX - touchStartX
      const dy = e.touches[0].clientY - touchStartY
      const elapsed = Date.now() - touchStartTime

      if (elapsed < 300) {
        const SWIPE_THRESHOLD = 25

        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0 && gameState.current.playerLane < 1) {
            gameState.current.playerLane++
            touchStartX = e.touches[0].clientX
            touchStartTime = Date.now()
            jumpTriggered = false // reset so touchEnd doesn't double-fire lane change
          } else if (dx < 0 && gameState.current.playerLane > -1) {
            gameState.current.playerLane--
            touchStartX = e.touches[0].clientX
            touchStartTime = Date.now()
            jumpTriggered = false
          }
        } else if (dy < -SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx) && !jumpTriggered) {
          tryJump(gameState.current)
          jumpTriggered = true
          touchStartY = e.touches[0].clientY
          touchStartTime = Date.now()
        } else if (dy > SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
          trySlide(gameState.current)
          touchStartY = e.touches[0].clientY
          touchStartTime = Date.now()
        }
      }
    }

    const handleTouchEnd = (e) => {
      if (!gameState.current.started) return

      if (gameState.current.gameOver) {
        const now = Date.now()
        const elapsed = now - touchStartTime
        const dx = e.changedTouches[0].clientX - touchStartX
        const dy = e.changedTouches[0].clientY - touchStartY
        const isShortTap = elapsed < 400 && Math.abs(dx) < 20 && Math.abs(dy) < 20
        if (isShortTap && now - lastRestartTime > 500) {
          lastRestartTime = now
          onRestart()
        }
        return
      }

      if (jumpTriggered) {
        releaseJump(gameState.current)
        return  // already handled in touchMove — don't process again in touchEnd
      }

      const dx = e.changedTouches[0].clientX - touchStartX
      const dy = e.changedTouches[0].clientY - touchStartY

      // Only fire from touchEnd if touchMove didn't already handle it (small movement)
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20 && gameState.current.playerLane < 1) {
          gameState.current.playerLane++
        } else if (dx < -20 && gameState.current.playerLane > -1) {
          gameState.current.playerLane--
        }
      } else if (dy < -20) {
        tryJump(gameState.current)
        releaseJump(gameState.current)
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameState, onRestart])
}
