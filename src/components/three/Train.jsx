import { useRef } from 'react'
import * as THREE from 'three'
import { TRAIN_VARIANTS, LANES, TRAIN_CAR_GAP } from '../../game/constants'

// No useFrame — position is set imperatively by GameScene each frame

function s(hex) { return new THREE.MeshBasicMaterial({ color: hex }) }
function w(hex) { return new THREE.MeshBasicMaterial({ color: hex, wireframe: true }) }

const matBody    = s(0x6A22C8)
const matBodyOut = w(0x1A1030)
const matRoof    = s(0x4E1898)
const matSkirt   = s(0x2A0A5A)
const matWin     = s(0xFFBB22)
const matDiv     = s(0x5518A8)
const matCouple  = s(0xAA2222)
const matWheel   = s(0x1A0A30)
const matLampO   = s(0xFF9900)
const matLampW   = s(0xFFEECC)

function TrainCar({ L, W, H, isLead, isTail }) {
  const hw = W / 2, hh = H / 2, hl = L / 2
  const WIN_W = 2.0, WIN_H = H * 0.58
  const wCount = Math.max(2, Math.floor((L - 2) / 2.8))
  const wStep  = (L - 2) / wCount
  const winZs  = Array.from({ length: wCount }, (_, i) => -hl + 1.1 + wStep * (i + 0.5))
  const divZs  = Array.from({ length: wCount - 1 }, (_, i) => -hl + 1.1 + wStep * (i + 1))
  const WIN_Y  = 0
  const doorZs = [-hl * 0.38, hl * 0.38]
  const DOOR_W = 1.2, DOOR_H = H * 0.80

  return (
    <group>
      <mesh material={matBody}><boxGeometry args={[W, H, L]} /></mesh>
      <mesh position={[0, hh+0.18, 0]} material={matRoof}><boxGeometry args={[W*0.96, 0.36, L*0.99]} /></mesh>
      <mesh position={[0, hh+0.30, 0]} material={matRoof}><boxGeometry args={[W*0.82, 0.18, L*0.99]} /></mesh>
      <mesh position={[0, -hh-0.20, 0]} material={matSkirt}><boxGeometry args={[W+0.12, 0.40, L*0.97]} /></mesh>

      {[-1,1].map(sd => winZs.map((wz,wi) => (
        <group key={`w${sd}${wi}`}>
          <mesh position={[sd*(hw+0.04), WIN_Y, wz]} material={matWin}><boxGeometry args={[0.12, WIN_H, WIN_W]} /></mesh>
        </group>
      )))}
      {[-1,1].map(sd => divZs.map((dz,di) => (
        <mesh key={`d${sd}${di}`} position={[sd*(hw+0.03), WIN_Y, dz]} material={matDiv}><boxGeometry args={[0.10, WIN_H+0.06, 0.20]} /></mesh>
      )))}
      {[-1,1].map(sd => doorZs.map((dz,di) => (
        <mesh key={`dr${sd}${di}`} position={[sd*(hw+0.02), 0, dz]} material={matDiv}><boxGeometry args={[0.06, DOOR_H, DOOR_W]} /></mesh>
      )))}
      {[-1,1].map(e => (
        <group key={e} position={[0, -hh-0.32, e*hl*0.58]}>
          <mesh material={matSkirt}><boxGeometry args={[W*0.86, 0.28, 1.9]} /></mesh>
          {[-1,1].map(ws => (
            <mesh key={ws} position={[ws*W*0.34,-0.22,0]} rotation={[Math.PI/2,0,0]} material={matWheel}>
              <cylinderGeometry args={[0.34,0.34,0.20,10]} />
            </mesh>
          ))}
        </group>
      ))}
      {!isTail && (
        <group position={[0,-hh*0.22,-(hl+0.10)]}>
          <mesh material={matCouple}><boxGeometry args={[W*0.60,H*0.58,0.28]} /></mesh>
        </group>
      )}
      {isLead && (
        <group position={[0,0,hl]}>
          <mesh material={matBody}><boxGeometry args={[W,H,0.12]} /></mesh>
          <mesh material={matSkirt} position={[0,-hh*0.35,0.38]}><boxGeometry args={[W*0.92,H*0.48,0.76]} /></mesh>
          <mesh position={[0,hh*0.22,0.48]} material={matWin}><boxGeometry args={[W*0.55,H*0.32,0.08]} /></mesh>
          <mesh position={[0,hh*0.58,0.28]} material={matWin}><boxGeometry args={[W*0.40,H*0.09,0.06]} /></mesh>
          {[-1,1].map(sd => (
            <group key={sd}>
              <mesh position={[sd*W*0.27,-hh*0.40,0.70]} rotation={[Math.PI/2,0,0]} material={matLampO}>
                <cylinderGeometry args={[0.20,0.20,0.10,10]} />
              </mesh>
              <mesh position={[sd*W*0.27,-hh*0.40,0.72]} rotation={[Math.PI/2,0,0]} material={matLampW}>
                <cylinderGeometry args={[0.11,0.11,0.06,10]} />
              </mesh>
            </group>
          ))}
          <mesh position={[0,-hh*0.78,0.60]} material={matSkirt}><boxGeometry args={[W*0.20,H*0.15,0.32]} /></mesh>
        </group>
      )}
    </group>
  )
}

export function Train({ obstacleRef, numCars=1, variant='normal' }) {
  const groupRef = useRef()
  const { length:L, width:W, height:H } = TRAIN_VARIANTS[variant] || TRAIN_VARIANTS.normal

  // Expose the group ref so GameScene can set position directly
  obstacleRef._mesh = groupRef

  return (
    <group ref={groupRef} frustumCulled={false}>
      {Array.from({length:numCars}).map((_,i) => (
        <group key={i} position={[0,0,-i*(L+TRAIN_CAR_GAP)]}>
          <TrainCar L={L} W={W} H={H} isLead={i===0} isTail={i===numCars-1} />
        </group>
      ))}
    </group>
  )
}
