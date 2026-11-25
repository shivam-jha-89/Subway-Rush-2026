import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { NUM_TIES_PER_TRACK, TIE_SPACING, TRACK_CENTERS } from '../../game/constants'

function m(hex, po = false) {
  return new THREE.MeshBasicMaterial({
    color: hex, polygonOffset: po, polygonOffsetFactor: po ? 2 : 0, polygonOffsetUnits: po ? 2 : 0,
  })
}

const matGround  = m(0x4A2014, true)
const matBetween = m(0x2A1008, true)
const matTie     = m(0x221006, true)
const matRail    = m(0x7A7888, true)
const matRailTop = m(0xB0AEC0, true)
const matBallast = m(0x6B3418, true)

const TIE_W  = 3.8
const tieGeo = new THREE.BoxGeometry(TIE_W, 0.16, 0.44)

export function TrainTracks({ scrollOffset, visible = true }) {
  const groupRefs = useRef([null, null, null])
  const meshRefs  = useRef([null, null, null])
  const dummy     = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    TRACK_CENTERS.forEach((cx, t) => {
      const mesh = meshRefs.current[t]
      if (!mesh) return
      for (let i = 0; i < NUM_TIES_PER_TRACK; i++) {
        dummy.position.set(cx, 0.08, 10 - i * TIE_SPACING)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    })
  }, [dummy])

  useFrame(() => {
    const mod = ((scrollOffset.current % TIE_SPACING) + TIE_SPACING) % TIE_SPACING
    groupRefs.current.forEach(g => { if (g) g.position.z = mod })
  })

  if (!visible) return null

  const RH = 0.20, RW = 0.11
  const RY = 0.16 + RH / 2

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -200]}
        material={matGround}>
        <planeGeometry args={[20, 500]} />
      </mesh>

      {[-2, 2].map(dx => (
        <mesh key={dx} position={[dx, 0.02, -200]} material={matBetween}>
          <boxGeometry args={[1.4, 0.06, 500]} />
        </mesh>
      ))}

      {[-1, 1].map(s => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]}
          position={[s * 7.0, -0.01, -200]} material={matBetween}>
          <planeGeometry args={[5.0, 500]} />
        </mesh>
      ))}

      {TRACK_CENTERS.map((cx, i) => (
        <mesh key={i} position={[cx, 0.04, -200]} material={matBallast}>
          <boxGeometry args={[TIE_W - 0.2, 0.08, 500]} />
        </mesh>
      ))}

      {TRACK_CENTERS.map((cx, t) => (
        <group key={t} ref={el => { groupRefs.current[t] = el }}>
          <instancedMesh
            ref={el => { meshRefs.current[t] = el }}
            args={[tieGeo, matTie, NUM_TIES_PER_TRACK]}
            frustumCulled={false}
          />
        </group>
      ))}

      {TRACK_CENTERS.map((cx, ti) =>
        [-1.22, 1.22].map((ox, ri) => {
          const rx = cx + ox
          return (
            <group key={`r${ti}${ri}`}>
              <mesh position={[rx, RY, -200]} material={matRail}>
                <boxGeometry args={[RW, RH, 500]} />
              </mesh>
              <mesh position={[rx, RY + RH / 2, -200]} material={matRailTop}>
                <boxGeometry args={[RW + 0.07, 0.05, 500]} />
              </mesh>
            </group>
          )
        })
      )}
    </group>
  )
}
