import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NUM_PILLARS, PILLAR_SPACING } from '../../game/constants'

// Pre-built shared materials — created once, never recreated
const matConcrete = new THREE.MeshBasicMaterial({ color: 0xD4C9B0 })
const matCap      = new THREE.MeshBasicMaterial({ color: 0xA09888 })
const matOutline  = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
const BAND_COLORS = [0xE8371A, 0x1A8FE3, 0x2CBF30, 0xA020F0, 0xFF9500]
const matBands    = BAND_COLORS.map(c => new THREE.MeshBasicMaterial({ color: c }))

// Shared geometries — one set for all pillars
const W = 0.55
const PILLAR_H = 8
const BAND_H   = PILLAR_H * 0.14
const BAND_Y   = -PILLAR_H * 0.5 + PILLAR_H * 0.38
const geoShaft = new THREE.BoxGeometry(W, PILLAR_H, W)
const geoShaftOut = new THREE.BoxGeometry(W + 0.04, PILLAR_H + 0.04, W + 0.04)
const geoBand  = new THREE.BoxGeometry(W + 0.04, BAND_H, W + 0.04)
const geoCap   = new THREE.BoxGeometry(W + 0.18, 0.22, W + 0.18)
const geoBase  = new THREE.BoxGeometry(W + 0.22, 0.20, W + 0.22)

function StationPillar({ pairIndex }) {
  return (
    <group>
      <mesh geometry={geoShaft}    material={matConcrete} />
      <mesh geometry={geoShaftOut} material={matOutline} />
      <mesh position={[0, BAND_Y, 0]} geometry={geoBand} material={matBands[pairIndex % matBands.length]} />
      <mesh position={[0,  PILLAR_H / 2 + 0.11, 0]} geometry={geoCap}  material={matCap} />
      <mesh position={[0, -PILLAR_H / 2 - 0.10, 0]} geometry={geoBase} material={matCap} />
    </group>
  )
}

// Shared arch geometries per arch radius — memoised at module level lazily
const archGeoCache = {}
function getArchGeo(radius, depth) {
  const key = `${radius}_${depth}`
  if (!archGeoCache[key]) {
    const g = new THREE.CylinderGeometry(radius, radius, depth, 24, 1, true, Math.PI / 2, Math.PI)
    g.rotateX(Math.PI / 2)
    archGeoCache[key] = g
  }
  return archGeoCache[key]
}
const matArch     = new THREE.MeshBasicMaterial({ color: 0xC0B8A8, side: THREE.DoubleSide })
const matArchOut  = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })

export function Pillars({ scrollOffset }) {
  const pillarX      = 7.2   // well outside LANES [-4,0,4] — no overlap with tracks
  const numPairs     = Math.floor(NUM_PILLARS / 2)

  const pillarData = useMemo(() => {
    const list = []
    for (let i = 0; i < numPairs; i++) {
      const baseZ = 20 - i * PILLAR_SPACING
      list.push({ side: -pillarX, baseZ, pairIndex: i })
      list.push({ side:  pillarX, baseZ, pairIndex: i })
    }
    return list
  }, [numPairs])

  const archData = useMemo(() =>
    Array.from({ length: numPairs }, (_, i) => ({ baseZ: 20 - i * PILLAR_SPACING, pairIndex: i }))
  , [numPairs])

  const archGeo    = useMemo(() => getArchGeo(pillarX, PILLAR_SPACING * 0.98), [pillarX])
  const archGeoOut = useMemo(() => getArchGeo(pillarX + 0.04, PILLAR_SPACING * 0.98), [pillarX])

  const pillarRefs = useRef([])
  const archRefs   = useRef([])
  const pairTotal  = numPairs * PILLAR_SPACING

  useFrame(() => {
    const scroll = scrollOffset.current
    const mod    = scroll % pairTotal

    for (let i = 0; i < pillarData.length; i++) {
      let z = pillarData[i].baseZ + mod
      if (z > 30)              z -= pairTotal
      else if (z < 30 - pairTotal) z += pairTotal
      if (pillarRefs.current[i]) pillarRefs.current[i].position.z = z
    }
    for (let i = 0; i < archData.length; i++) {
      let z = archData[i].baseZ + mod
      if (z > 30)              z -= pairTotal
      else if (z < 30 - pairTotal) z += pairTotal
      if (archRefs.current[i]) archRefs.current[i].position.z = z
    }
  })

  return (
    <group frustumCulled={false}>
      {pillarData.map((d, i) => (
        <group key={`p${i}`} ref={el => { pillarRefs.current[i] = el }}
          position={[d.side, PILLAR_H / 2, d.baseZ]} frustumCulled={false}>
          <StationPillar pairIndex={d.pairIndex} />
        </group>
      ))}
      {archData.map((d, i) => (
        <group key={`a${i}`} ref={el => { archRefs.current[i] = el }}
          position={[0, PILLAR_H, d.baseZ]} frustumCulled={false}>
          <mesh geometry={archGeo}    material={matArch} />
          <mesh geometry={archGeoOut} material={matArchOut} />
        </group>
      ))}
    </group>
  )
}
