export function StartScreen({ onStart }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 100,
    }}>
      <div style={{
        color: '#fff',
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '48px',
        letterSpacing: '4px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        SUBWAY SURFERS
      </div>

      <div style={{
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '12px',
        letterSpacing: '3px',
        marginBottom: '60px',
        textAlign: 'center',
      }}>
        SWIPE OR ARROW KEYS TO MOVE
      </div>

      <button
        onClick={onStart}
        style={{
          background: 'rgba(255,139,202,0.3)',
          border: '2px solid rgba(255,139,202,0.6)',
          color: '#fff',
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '18px',
          letterSpacing: '3px',
          padding: '16px 48px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255,139,202,0.5)'
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255,139,202,0.3)'
        }}
      >
        START
      </button>

      <div style={{
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '10px',
        letterSpacing: '2px',
        marginTop: '40px',
        textAlign: 'center',
      }}>
        ARROW KEYS / WASD / SWIPE
      </div>
    </div>
  )
}
