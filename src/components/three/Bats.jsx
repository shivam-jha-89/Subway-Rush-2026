import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// All bats in ONE useFrame — was 15 separate useFrame hooks
const matBat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
const matWing = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide })
const gBody = new THREE.SphereGeometry(0.08, 5, 4)
const gWing = new THREE.PlaneGeometry(0.35, 0.12)

function BatMesh({ batRef }) {
  const groupRef  = useRef()
  const lwRef     = useRef()
  const rwRef     = useRef()
  batRef.groupRef = groupRef
  batRef.lwRef    = lwRef
  batRef.rwRef    = rwRef
  return (
    <group ref={groupRef} position={batRef.pos}>
      <mesh geometry={gBody} material={matBat} />
      <group ref={lwRef} position={[-0.05, 0, 0]}>
        <mesh geometry={gWing} material={matWing} position={[-0.15, 0, 0]} />
      </group>
      <group ref={rwRef} position={[0.05, 0, 0]}>
        <mesh geometry={gWing} material={matWing} position={[0.15, 0, 0]} />
      </group>
    </group>
  )
}

export function BatSwarm({ count = 8 }) {
  const bats = useMemo(() => Array.from({ length: count }, (_, i) => ({
    pos: [(Math.random() - 0.5) * 16, 3 + Math.random() * 7, -30 - Math.random() * 60],
    speed: 0.12 + Math.random() * 0.12,
    wingSpeed: 12 + Math.random() * 8,
    offset: Math.random() * Math.PI * 2,
    groupRef: null, lwRef: null, rwRef: null,
  })), [count])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    for (const bat of bats) {
      if (!bat.groupRef?.current) continue
      bat.pos[2] += bat.speed * delta * 60
      if (bat.pos[2] > 15) {
        bat.pos[2] = -90 - Math.random() * 40
        bat.pos[0] = (Math.random() - 0.5) * 16
        bat.pos[1] = 3 + Math.random() * 7
      }
      bat.groupRef.current.position.set(
        bat.pos[0] + Math.sin(t * 1.8 + bat.offset) * 0.4,
        bat.pos[1] + Math.sin(t * 2.5 + bat.offset) * 0.25,
        bat.pos[2]
      )
      const wa = Math.sin(t * bat.wingSpeed + bat.offset) * 0.8
      if (bat.lwRef?.current) bat.lwRef.current.rotation.z =  wa + 0.3
      if (bat.rwRef?.current) bat.rwRef.current.rotation.z = -wa - 0.3
    }
  })

  return (
    <>{bats.map((b, i) => <BatMesh key={i} batRef={b} />)}</>
  )
}
