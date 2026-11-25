import { useRef } from 'react'
import { LANES } from '../../game/constants'
import * as THREE from 'three'

function m(hex) {
  return new THREE.MeshBasicMaterial({ color: hex, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
}
function mw(hex) { return new THREE.MeshBasicMaterial({ color: hex, wireframe: true }) }

const matWhite   = m(0xFFFFFF)
const matRed     = m(0xDD1111)
const matOrange  = m(0xFF5500)
const matYellow  = m(0xFFCC00)
const matBlack   = m(0x111111)
const matMetal   = m(0x999999)
const matDkMetal = m(0x444444)
const matOut     = mw(0x000000)

const PW = 3.2
const PH = 1.4
const STRIPE_COUNT = 7
const GROUP_Y = PH / 2 + 0.38

function BarrierPanel() {
  const hw = PW / 2, hh = PH / 2
  const sw = PW / STRIPE_COUNT
  return (
    <group>
      <mesh material={matWhite}><boxGeometry args={[PW, PH, 0.18]} /></mesh>

      {Array.from({ length: STRIPE_COUNT }).map((_, i) => {
        if (i % 2 !== 0) return null
        const cx = -hw + sw * (i + 0.5)
        return (
          <mesh key={i} position={[cx, 0, 0.10]} rotation={[0, 0, Math.PI / 4]} material={matRed}>
            <boxGeometry args={[sw * 0.85, PH * 1.8, 0.10]} />
          </mesh>
        )
      })}

      <mesh position={[0, hh - 0.07, 0.10]} material={matMetal}>
        <boxGeometry args={[PW, 0.14, 0.22]} />
      </mesh>
      <mesh position={[0, hh - 0.07, 0.10]} material={matOut}>
        <boxGeometry args={[PW + 0.04, 0.18, 0.26]} />
      </mesh>
      <mesh position={[0, -hh + 0.07, 0.10]} material={matMetal}>
        <boxGeometry args={[PW, 0.14, 0.22]} />
      </mesh>
      <mesh position={[0, -hh + 0.07, 0.10]} material={matOut}>
        <boxGeometry args={[PW + 0.04, 0.18, 0.26]} />
      </mesh>

      {[-1, 1].map(s => (
        <group key={s}>
          <mesh position={[s * (hw - 0.07), 0, 0.10]} material={matMetal}>
            <boxGeometry args={[0.14, PH, 0.22]} />
          </mesh>
          <mesh position={[s * (hw - 0.07), 0, 0.10]} material={matOut}>
            <boxGeometry args={[0.18, PH + 0.04, 0.26]} />
          </mesh>
        </group>
      ))}

      <mesh material={matOut}><boxGeometry args={[PW + 0.06, PH + 0.06, 0.22]} /></mesh>
    </group>
  )
}

function Cone({ x }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 0.06, 0]} material={matOrange}>
        <boxGeometry args={[0.56, 0.12, 0.56]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={matOrange}>
        <cylinderGeometry args={[0.06, 0.22, 1.0, 7]} />
      </mesh>
      <mesh position={[0, 0.40, 0]} material={matWhite}>
        <cylinderGeometry args={[0.18, 0.18, 0.10, 7]} />
      </mesh>
    </group>
  )
}

function CautionTape({ width }) {
  // Single mesh with alternating color — use just 2 meshes instead of 14
  return (
    <group>
      <mesh position={[0, 0, 0]} material={matYellow}>
        <boxGeometry args={[width, 0.18, 0.06]} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-width/2 + (width/7)*(i+0.5), 0, 0.02]} material={matBlack}>
          <boxGeometry args={[width/14, 0.16, 0.04]} />
        </mesh>
      ))}
    </group>
  )
}

export function Barrier({ obstacleRef }) {
  const groupRef    = useRef()
  const initialLane = useRef(obstacleRef?.lane)

  // Expose ref — GameScene sets position directly, no useFrame needed
  obstacleRef._mesh = groupRef

  const lane = initialLane.current ?? obstacleRef?.lane
  const laneX = LANES[lane + 1]

  const legH = 0.42

  return (
    <group ref={groupRef} position={[laneX, GROUP_Y, -9999]} frustumCulled={false}>
      <BarrierPanel />

      {[-1, 1].map(s => (
        <group key={s} position={[s * (PW / 2 - 0.20), -PH / 2 - legH / 2, 0.08]}>
          <mesh material={matDkMetal}>
            <boxGeometry args={[0.18, legH, 0.58]} />
          </mesh>
          <mesh material={matOut}>
            <boxGeometry args={[0.22, legH + 0.04, 0.62]} />
          </mesh>
        </group>
      ))}

      <Cone x={-(PW / 2 + 0.42)} />
      <Cone x={  PW / 2 + 0.42} />

      <group position={[0, PH / 2 + 0.22, 0.10]}>
        <CautionTape width={PW + 1.0} />
      </group>

      <group position={[0, PH / 2 + 0.56, 0]}>
        <mesh material={matRed}><boxGeometry args={[1.10, 0.34, 0.10]} /></mesh>
        <mesh material={matOut}><boxGeometry args={[1.14, 0.38, 0.10]} /></mesh>
        <mesh position={[0, 0, 0.06]} material={matWhite}>
          <boxGeometry args={[0.80, 0.10, 0.06]} />
        </mesh>
      </group>
    </group>
  )
}
