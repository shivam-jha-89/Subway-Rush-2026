import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Two-mesh seamless scroll:
// Mesh A at z=offset, Mesh B at z=offset-TOTAL_LEN
// Both move +Z together. When A passes camera, it jumps back by TOTAL_LEN.
// Since B is exactly one period behind, there's never a gap.

const SEG      = 20
const POOL     = 8
const TOTAL_LEN = POOL * SEG   // 160 — smaller loop, stays in fog range

// ── Colours ──────────────────────────────────────────────────────────────────
const BLDG_DARK = [0x1A1035, 0x0A1A3A, 0x1A0A2A, 0x0A1A1A, 0x1A1A0A, 0x0A0A2A]
const NEON      = [0x00FFFF, 0x00FF41, 0xFFFF00, 0xFF6600, 0x00BFFF, 0xAAFF00]
const WIN_NEON  = [0x88FFFF, 0x88FF90, 0xFFFF80, 0xFFB060, 0x80DFFF, 0xCCFF80]

function hex2rgb(hex) {
  return [(hex>>16&255)/255, (hex>>8&255)/255, (hex&255)/255]
}

// ── Manual buffer builder ─────────────────────────────────────────────────────
function addBox(P, N, UV, IX, C, x, y, z, w, h, d, col) {
  const [r,g,b] = hex2rgb(col)
  const hw=w/2, hh=h/2, hd=d/2
  const faces = [
    [[x+hw,y-hh,z-hd],[x+hw,y+hh,z-hd],[x+hw,y+hh,z+hd],[x+hw,y-hh,z+hd],[1,0,0]],
    [[x-hw,y-hh,z+hd],[x-hw,y+hh,z+hd],[x-hw,y+hh,z-hd],[x-hw,y-hh,z-hd],[-1,0,0]],
    [[x-hw,y+hh,z-hd],[x-hw,y+hh,z+hd],[x+hw,y+hh,z+hd],[x+hw,y+hh,z-hd],[0,1,0]],
    [[x-hw,y-hh,z+hd],[x-hw,y-hh,z-hd],[x+hw,y-hh,z-hd],[x+hw,y-hh,z+hd],[0,-1,0]],
    [[x+hw,y-hh,z+hd],[x+hw,y+hh,z+hd],[x-hw,y+hh,z+hd],[x-hw,y-hh,z+hd],[0,0,1]],
    [[x-hw,y-hh,z-hd],[x-hw,y+hh,z-hd],[x+hw,y+hh,z-hd],[x+hw,y-hh,z-hd],[0,0,-1]],
  ]
  faces.forEach(([v0,v1,v2,v3,n]) => {
    const i = P.length/3
    ;[v0,v1,v2,v3].forEach(v => { P.push(v[0],v[1],v[2]); N.push(n[0],n[1],n[2]); UV.push(0,0); C.push(r,g,b) })
    IX.push(i,i+1,i+2, i,i+2,i+3)
  })
}

function rng(seed) {
  let s = (seed*1664525+1013904223)>>>0
  return () => { s=(s*1664525+1013904223)>>>0; return s/0xffffffff }
}

function buildGeo(side) {
  const P=[],N=[],UV=[],IX=[],C=[]

  for (let i = 0; i < POOL; i++) {
    const r      = rng(i*61 + (side>0?3000:7000))
    const segZ   = -(i * SEG) + SEG      // z=SEG to z=-(POOL-1)*SEG
    const neon   = NEON[i % NEON.length]
    const winCol = WIN_NEON[i % WIN_NEON.length]

    const floors = 3 + Math.floor(r()*3)
    const FH     = 3.2
    const bH     = floors * FH
    const bW     = 6 + r()*6
    const bD     = SEG * 0.95
    const bx     = side * (7.4 + bW*0.5)
    const faceX  = bx - side*(bW*0.5 + 0.05)
    const bldgCol = BLDG_DARK[Math.floor(r()*BLDG_DARK.length)]

    // Building body
    addBox(P,N,UV,IX,C, bx, bH/2, segZ, bW, bH, bD, bldgCol)

    // Neon floor bands
    for (let fl=0; fl<=floors; fl++) {
      addBox(P,N,UV,IX,C, bx, fl*FH, segZ, bW+0.12, 0.20, bD+0.08, neon)
    }

    // Windows — 2 per floor per side
    for (let fl=0; fl<floors; fl++) {
      const wy = fl*FH + FH*0.52
      for (let col=0; col<2; col++) {
        const wz = segZ - bD*0.3 + col*bD*0.6
        addBox(P,N,UV,IX,C, faceX, wy, wz, 0.09, 1.0, 0.90, r()>0.35 ? winCol : 0x060A0A)
      }
    }

    // Billboard (1 per segment)
    const bColor = NEON[Math.floor(r()*NEON.length)]
    const bW2 = 2.8+r()*2, bH2 = 1.8+r()*1.2
    const bY  = FH*(1+Math.floor(r()*Math.max(1,floors-1))) + bH2*0.5
    addBox(P,N,UV,IX,C, faceX-side*0.04, bY, segZ, 0.12, bH2, bW2, bColor)

    // Roof
    addBox(P,N,UV,IX,C, bx, bH+0.15, segZ, bW+0.2, 0.30, bD+0.2, 0x080510)

    // Lamp pole
    const lx = side*5.9
    addBox(P,N,UV,IX,C, lx, 3.5, segZ, 0.13, 7.0, 0.13, 0x303050)
    addBox(P,N,UV,IX,C, lx-side*0.7, 7.1, segZ, 1.4, 0.11, 0.11, 0x303050)
    addBox(P,N,UV,IX,C, lx-side*1.4, 7.0, segZ, 0.52, 0.19, 0.36, neon)
    addBox(P,N,UV,IX,C, lx-side*1.4, 6.88, segZ, 0.38, 0.09, 0.26, 0xFFFFEE)

    // Road/kerb
    addBox(P,N,UV,IX,C, side*6.1, -0.05, segZ, 2.0, 0.10, SEG, 0x0A0A12)
    addBox(P,N,UV,IX,C, side*7.0, 0.12, segZ, 0.22, 0.22, SEG, 0x18183A)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(N, 3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(UV, 2))
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(C, 3))
  geo.setIndex(IX)
  return geo
}

const matVC   = new THREE.MeshBasicMaterial({ vertexColors: true })
const matSky  = new THREE.MeshBasicMaterial({ color: 0x080618 })
const matHorz = new THREE.MeshBasicMaterial({ color: 0x1A0838 })
const gSkyB   = new THREE.PlaneGeometry(500, 70)
const gSkyH   = new THREE.PlaneGeometry(500, 12)
const gSkyC   = new THREE.PlaneGeometry(80, 300)

export function ScrollingWalls({ scrollOffset, gameState }) {
  const geoL = useMemo(() => buildGeo(-1), [])
  const geoR = useMemo(() => buildGeo( 1), [])

  // Two copies per side for seamless wrap
  const refLA = useRef(), refLB = useRef()
  const refRA = useRef(), refRB = useRef()
  const scroll = useRef(0)
  const wasOver = useRef(false)

  useFrame((_, delta) => {
    const gs = gameState?.current
    if (!gs) return

    if (wasOver.current && gs.started && !gs.gameOver) {
      scroll.current = 0
    }
    wasOver.current = gs.gameOver
    if (!gs.started || gs.gameOver) return

    scroll.current += gs.speed * delta * 0.48

    const z = scroll.current % TOTAL_LEN

    // Mesh A and B tile seamlessly — A at z, B exactly one period behind
    // Geometry spans from +SEG to -(POOL-1)*SEG (about -140 to +20)
    // Both meshes keep that range covered as they scroll
    if (refLA.current) refLA.current.position.z = z
    if (refLB.current) refLB.current.position.z = z - TOTAL_LEN
    if (refRA.current) refRA.current.position.z = z
    if (refRB.current) refRB.current.position.z = z - TOTAL_LEN
  })

  return (
    <group frustumCulled={false}>
      <mesh position={[0,22,-120]} geometry={gSkyB} material={matSky} />
      <mesh position={[0, 7,-112]} geometry={gSkyH} material={matHorz} />
      <mesh position={[0,32,  -60]} rotation={[Math.PI/2,0,0]} geometry={gSkyC} material={matSky} />

      {/* Two copies per side — A and B, offset by TOTAL_LEN */}
      <mesh ref={refLA} geometry={geoL} material={matVC} />
      <mesh ref={refLB} geometry={geoL} material={matVC} />
      <mesh ref={refRA} geometry={geoR} material={matVC} />
      <mesh ref={refRB} geometry={geoR} material={matVC} />
    </group>
  )
}
