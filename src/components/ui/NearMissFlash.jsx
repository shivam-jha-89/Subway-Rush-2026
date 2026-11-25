export function NearMissFlash({ intensity }) {
  if (intensity <= 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 50,
        background: `radial-gradient(ellipse at center,
          rgba(255, 105, 180, ${intensity * 0.4}) 0%,
          rgba(255, 105, 180, ${intensity * 0.2}) 30%,
          transparent 70%)`,
        transition: 'opacity 0.15s ease-out',
      }}
    />
  )
}
