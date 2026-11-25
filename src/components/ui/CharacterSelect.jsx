import { useState } from 'react'

const CHARS = [
  { id:'brody',  file:'icon-00-brody.png',  name:'Brody',  locked:false },
  { id:'tagbot', file:'icon-01-tagbot.png', name:'Tagbot', locked:false },
  { id:'tasha',  file:'icon-02-tasha.png',  name:'Tasha',  locked:false },
  { id:'ninja',  file:'icon-03-ninja.png',  name:'Ninja',  locked:false },
  { id:'lucy',   file:'icon-04-lucy.png',   name:'Lucy',   locked:true  },
  { id:'king',   file:'icon-05-king.png',   name:'King',   locked:true  },
  { id:'yutani', file:'icon-07-yutani.png', name:'Yutani', locked:true  },
  { id:'spike',  file:'icon-08-spike.png',  name:'Spike',  locked:true  },
  { id:'fresh',  file:'icon-09-fresh.png',  name:'Fresh',  locked:true  },
  { id:'tricky', file:'icon-11-tricky.png', name:'Tricky', locked:true  },
]

export function CharacterSelect({ onNext }) {
  const [idx, setIdx] = useState(0)
  const cur = CHARS[idx]
  const prev = () => setIdx(i => (i - 1 + CHARS.length) % CHARS.length)
  const next = () => setIdx(i => (i + 1) % CHARS.length)

  return (
    <div style={{
      position:'absolute', inset:0, background:'#0d0d0d',
      display:'flex', flexDirection:'column',
      fontFamily:'Impact, Arial Black, sans-serif',
      userSelect:'none', zIndex:200, overflow:'hidden',
    }}>
      {/* Header */}
      <div style={{ textAlign:'center', padding:'20px 0 6px' }}>
        <img src="/splash.png" alt="logo" style={{
          height:44, objectFit:'contain',
          filter:'drop-shadow(0 2px 10px rgba(255,140,0,0.5))',
        }}/>
        <p style={{ margin:'6px 0 0', color:'rgba(255,255,255,0.35)',
          fontSize:10, letterSpacing:5, fontFamily:'Arial', fontWeight:'normal' }}>
          SELECT CHARACTER
        </p>
      </div>

      {/* Carousel */}
      <div style={{ flex:1, display:'flex', alignItems:'center',
        justifyContent:'center', gap:8, padding:'0 12px', minHeight:0 }}>

        <button onClick={prev} style={arrowBtn}>‹</button>

        <div style={{ flex:1, maxWidth:300, display:'flex',
          flexDirection:'column', alignItems:'center', gap:14 }}>

          {/* Portrait */}
          <div style={{
            width:180, height:180, borderRadius:20,
            background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.08)',
            display:'flex', alignItems:'center', justifyContent:'center',
            position:'relative', overflow:'hidden',
          }}>
            <img key={cur.id} src={`/images/${cur.file}`} alt={cur.name}
              style={{
                width:120, height:120, objectFit:'contain',
                filter: cur.locked ? 'grayscale(1) brightness(0.25)' : 'none',
                animation: cur.locked ? 'none' : 'csFloat 3s ease-in-out infinite',
              }}/>
            {cur.locked && (
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)',
                display:'flex', flexDirection:'column', alignItems:'center',
                justifyContent:'center', gap:4 }}>
                <span style={{ fontSize:32 }}>🔒</span>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:9,
                  letterSpacing:3, fontFamily:'Arial' }}>LOCKED</span>
              </div>
            )}
          </div>

          {/* Name */}
          <div style={{ color: cur.locked ? 'rgba(255,255,255,0.25)' : '#fff',
            fontSize:24, fontWeight:900, letterSpacing:3 }}>
            {cur.name.toUpperCase()}
          </div>

          {/* Stats */}
          {!cur.locked && (
            <div style={{ display:'flex', gap:20, background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'8px 16px' }}>
              {[['SPEED',3+(idx%3)],['JUMP',2+(idx%4)],['STYLE',4+(idx%2)]].map(([label,val]) => (
                <div key={label} style={{ display:'flex', flexDirection:'column',
                  alignItems:'center', gap:5 }}>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:8,
                    letterSpacing:2, fontFamily:'Arial' }}>{label}</span>
                  <div style={{ display:'flex', gap:2 }}>
                    {Array.from({length:5}).map((_,i) => (
                      <div key={i} style={{ width:10, height:3, borderRadius:2,
                        background: i < val ? '#fff' : 'rgba(255,255,255,0.12)' }}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={next} style={arrowBtn}>›</button>
      </div>

      {/* Dots */}
      <div style={{ display:'flex', justifyContent:'center', gap:5, marginBottom:10 }}>
        {CHARS.map((_,i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            border:'none', cursor:'pointer', padding:0, height:4, borderRadius:2,
            transition:'all 0.2s', width: i===idx ? 20 : 4,
            background: i===idx ? '#fff' : 'rgba(255,255,255,0.2)',
          }}/>
        ))}
      </div>

      {/* Thumbnails */}
      <div style={{ display:'flex', gap:6, overflowX:'auto', padding:'0 14px 12px',
        justifyContent:'center', scrollbarWidth:'none' }}>
        {CHARS.map((c,i) => (
          <button key={c.id} onClick={() => setIdx(i)} style={{
            flexShrink:0, width:50, height:50, borderRadius:10, border:'none',
            cursor:'pointer', padding:3, display:'flex', alignItems:'center', justifyContent:'center',
            background: i===idx ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
            outline: i===idx ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid transparent',
            transition:'all 0.15s',
          }}>
            <img src={`/images/${c.file}`} alt={c.name}
              style={{ width:36, height:36, objectFit:'contain',
                filter: c.locked ? 'grayscale(1) brightness(0.25)' : 'none' }}/>
          </button>
        ))}
      </div>

      {/* Button */}
      <div style={{ padding:'0 20px 28px' }}>
        <button onClick={() => !cur.locked && onNext(cur.id)} disabled={cur.locked}
          style={{
            width:'100%', height:54, border:'none', borderRadius:14,
            fontSize:16, fontWeight:900, letterSpacing:4,
            cursor: cur.locked ? 'not-allowed' : 'pointer',
            background: cur.locked ? 'rgba(255,255,255,0.06)' : '#FF6B00',
            color: cur.locked ? 'rgba(255,255,255,0.2)' : '#fff',
            boxShadow: cur.locked ? 'none' : '0 4px 20px rgba(255,107,0,0.4)',
          }}>
          {cur.locked ? '🔒  LOCKED' : 'SELECT'}
        </button>
      </div>

      <style>{`@keyframes csFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  )
}

const arrowBtn = {
  width:36, height:36, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.1)',
  background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.6)',
  fontSize:26, cursor:'pointer', flexShrink:0,
}
