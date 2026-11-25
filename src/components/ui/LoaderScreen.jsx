import { useEffect, useState } from 'react'

export function LoaderScreen({ onDone }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const steps = [10, 25, 40, 58, 72, 85, 94, 100]
    let i = 0
    const iv = setInterval(() => {
      if (i < steps.length) { setProgress(steps[i]); i++ }
      else { clearInterval(iv); setTimeout(onDone, 350) }
    }, 260)
    return () => clearInterval(iv)
  }, [onDone])

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg,#0b0020 0%,#1a0040 60%,#0b0020 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }}>
      <img src="/splash.png" alt="logo" style={{
        width: 300, objectFit: 'contain',
        filter: 'drop-shadow(0 0 24px rgba(255,160,0,0.7))',
        marginBottom: 40,
      }} />

      <div style={{ width: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: '100%', height: 18, borderRadius: 9,
          background: 'rgba(0,0,0,0.6)',
          border: '2px solid rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 9,
            width: `${progress}%`,
            background: 'linear-gradient(90deg,#f65000,#FFD700,#f65000)',
            backgroundSize: '200% 100%',
            transition: 'width 0.25s ease-out',
            animation: 'loaderShimmer 1.2s linear infinite',
          }} />
        </div>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 3, fontFamily: 'Arial' }}>
          {progress < 100 ? 'LOADING...' : 'READY!'}
        </span>
      </div>

      <style>{`
        @keyframes loaderShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  )
}
