import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { LANES } from '../../game/constants'
import * as THREE from 'three'

// All materials at module level — never recreated
const matSkin    = new THREE.MeshBasicMaterial({ color: 0xF5C5A3 })
const matHair    = new THREE.MeshBasicMaterial({ color: 0xFFD700 })
const matHairDk  = new THREE.MeshBasicMaterial({ color: 0xAA7700 })
const matHood    = new THREE.MeshBasicMaterial({ color: 0x00BCD4 })
const matHoodDk  = new THREE.MeshBasicMaterial({ color: 0x006978 })
const matPants   = new THREE.MeshBasicMaterial({ color: 0x1565C0 })
const matPantsDk = new THREE.MeshBasicMaterial({ color: 0x0D47A1 })
const matShoe    = new THREE.MeshBasicMaterial({ color: 0xF0F0F0 })
const matSole    = new THREE.MeshBasicMaterial({ color: 0x111111 })
const matBag     = new THREE.MeshBasicMaterial({ color: 0xFFB300 })
const matBagDk   = new THREE.MeshBasicMaterial({ color: 0xCC8800 })
const matBlack   = new THREE.MeshBasicMaterial({ color: 0x111111 })
const matOutline = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })

export function Player({ gameState }) {
  const rootRef  = useRef()
  const bodyRef  = useRef()
  const headRef  = useRef()
  const armLRef  = useRef()
  const armRRef  = useRef()
  const legLRef  = useRef()
  const legRRef  = useRef()
  const shinLRef = useRef()
  const shinRRef = useRef()

  useFrame((state) => {
    if (!rootRef.current || !gameState.current) return
    const { playerLane, jumpHeight, started, gameOver, isSliding } = gameState.current
    const t = state.clock.elapsedTime
    const running = started && !gameOver

    rootRef.current.position.x = LANES[playerLane + 1]
    rootRef.current.position.z = 0

    if (isSliding) {
      rootRef.current.position.y = 0.28
      rootRef.current.rotation.x = -0.4
      return
    }

    rootRef.current.position.y = jumpHeight + 0.60
    rootRef.current.rotation.x = 0

    if (!running) {
      const b = Math.sin(t * 1.8) * 0.012
      if (bodyRef.current) bodyRef.current.scale.y = 1 + b
      if (armLRef.current) armLRef.current.rotation.x = Math.sin(t * 1.2) * 0.09
      if (armRRef.current) armRRef.current.rotation.x = Math.sin(t * 1.2 + 0.5) * 0.09
      if (legLRef.current) legLRef.current.rotation.x = 0
      if (legRRef.current) legRRef.current.rotation.x = 0
      if (shinLRef.current) shinLRef.current.rotation.x = -0.05
      if (shinRRef.current) shinRRef.current.rotation.x = -0.05
      return
    }

    const cy   = t * 10
    const legL = Math.sin(cy) * 0.55
    const legR = -legL
    const shinL = Math.max(0, -Math.sin(cy)) * 0.8
    const shinR = Math.max(0,  Math.sin(cy)) * 0.8
    const bob   = Math.abs(Math.sin(cy)) * 0.03

    rootRef.current.rotation.x = -0.12
    if (legLRef.current)  legLRef.current.rotation.x  = legL
    if (legRRef.current)  legRRef.current.rotation.x  = legR
    if (shinLRef.current) shinLRef.current.rotation.x = -shinL
    if (shinRRef.current) shinRRef.current.rotation.x = -shinR
    if (armLRef.current)  armLRef.current.rotation.x  = -legL * 0.65
    if (armRRef.current)  armRRef.current.rotation.x  = -legR * 0.65
    if (bodyRef.current)  { bodyRef.current.scale.y = 1; bodyRef.current.position.y = 0.50 + bob }
    if (headRef.current)  headRef.current.position.y = 0.92 + bob
  })

  // Character faces -Z (toward train). Camera is at +Z behind player.
  // Backpack and back of hoodie are what the camera sees.
  return (
    <group ref={rootRef} position={[0, 0.60, 0]} frustumCulled={false}>

      {/* ── LEFT LEG ── */}
      <group ref={legLRef} position={[-0.13, 0.24, 0]}>
        <mesh material={matPants} position={[0, -0.20, 0]}>
          <boxGeometry args={[0.22, 0.40, 0.21]} />
        </mesh>
        <group ref={shinLRef} position={[0, -0.43, 0]}>
          <mesh material={matPantsDk} position={[0, -0.18, 0]}>
            <boxGeometry args={[0.20, 0.36, 0.20]} />
          </mesh>
          {/* Shoe */}
          <mesh material={matShoe} position={[0, -0.39, 0.03]}>
            <boxGeometry args={[0.24, 0.13, 0.32]} />
          </mesh>
          <mesh material={matSole} position={[0, -0.46, 0.03]}>
            <boxGeometry args={[0.24, 0.06, 0.32]} />
          </mesh>
        </group>
      </group>

      {/* ── RIGHT LEG ── */}
      <group ref={legRRef} position={[0.13, 0.24, 0]}>
        <mesh material={matPants} position={[0, -0.20, 0]}>
          <boxGeometry args={[0.22, 0.40, 0.21]} />
        </mesh>
        <group ref={shinRRef} position={[0, -0.43, 0]}>
          <mesh material={matPantsDk} position={[0, -0.18, 0]}>
            <boxGeometry args={[0.20, 0.36, 0.20]} />
          </mesh>
          <mesh material={matShoe} position={[0, -0.39, 0.03]}>
            <boxGeometry args={[0.24, 0.13, 0.32]} />
          </mesh>
          <mesh material={matSole} position={[0, -0.46, 0.03]}>
            <boxGeometry args={[0.24, 0.06, 0.32]} />
          </mesh>
        </group>
      </group>

      {/* ── TORSO ── */}
      <group ref={bodyRef} position={[0, 0.50, 0]}>
        {/* Back of hoodie — faces camera */}
        <mesh material={matHoodDk} position={[0, 0, 0]}>
          <boxGeometry args={[0.54, 0.56, 0.27]} />
        </mesh>
        <mesh material={matOutline} position={[0, 0, 0]}>
          <boxGeometry args={[0.58, 0.60, 0.31]} />
        </mesh>

        {/* Backpack — most visible from behind */}
        <mesh material={matBag} position={[0, 0.04, 0.18]}>
          <boxGeometry args={[0.30, 0.40, 0.15]} />
        </mesh>
        <mesh material={matBagDk} position={[0, 0.25, 0.18]}>
          <boxGeometry args={[0.12, 0.06, 0.10]} />
        </mesh>
        <mesh material={matBagDk} position={[-0.18, 0.04, 0.18]}>
          <boxGeometry args={[0.07, 0.20, 0.10]} />
        </mesh>
        <mesh material={matBagDk} position={[0.18, 0.04, 0.18]}>
          <boxGeometry args={[0.07, 0.20, 0.10]} />
        </mesh>

        {/* Hood bulge */}
        <mesh material={matHoodDk} position={[0, 0.34, 0.12]}>
          <boxGeometry args={[0.32, 0.20, 0.14]} />
        </mesh>

        {/* LEFT ARM */}
        <group ref={armLRef} position={[-0.33, 0.18, 0]}>
          <mesh material={matHoodDk} position={[0, -0.17, 0]}>
            <boxGeometry args={[0.20, 0.34, 0.20]} />
          </mesh>
          <mesh material={matSkin} position={[0, -0.46, 0]}>
            <boxGeometry args={[0.18, 0.28, 0.18]} />
          </mesh>
        </group>

        {/* RIGHT ARM */}
        <group ref={armRRef} position={[0.33, 0.18, 0]}>
          <mesh material={matHoodDk} position={[0, -0.17, 0]}>
            <boxGeometry args={[0.20, 0.34, 0.20]} />
          </mesh>
          <mesh material={matSkin} position={[0, -0.46, 0]}>
            <boxGeometry args={[0.18, 0.28, 0.18]} />
          </mesh>
        </group>
      </group>

      {/* ── HEAD ── */}
      <group ref={headRef} position={[0, 0.92, 0]}>
        {/* Skull */}
        <mesh material={matSkin} position={[0, 0, 0]}>
          <boxGeometry args={[0.38, 0.40, 0.34]} />
        </mesh>
        <mesh material={matOutline} position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.44, 0.38]} />
        </mesh>

        {/* Hair base */}
        <mesh material={matHair} position={[0, 0.23, 0]}>
          <boxGeometry args={[0.40, 0.14, 0.36]} />
        </mesh>
        {/* Spikes — visible from behind (toward camera) */}
        <mesh material={matHair} position={[0, 0.38, 0.10]}>
          <boxGeometry args={[0.10, 0.20, 0.10]} />
        </mesh>
        <mesh material={matHairDk} position={[-0.12, 0.35, 0.08]}>
          <boxGeometry args={[0.10, 0.16, 0.10]} />
        </mesh>
        <mesh material={matHairDk} position={[0.12, 0.35, 0.08]}>
          <boxGeometry args={[0.10, 0.16, 0.10]} />
        </mesh>
        {/* Side hair */}
        <mesh material={matHairDk} position={[-0.22, 0.18, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.30]} />
        </mesh>
        <mesh material={matHairDk} position={[0.22, 0.18, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.30]} />
        </mesh>

        {/* Eyes — on -Z face (toward train, facing forward) */}
        <mesh material={matBlack} position={[-0.09, 0.06, -0.18]}>
          <boxGeometry args={[0.08, 0.07, 0.03]} />
        </mesh>
        <mesh material={matBlack} position={[0.09, 0.06, -0.18]}>
          <boxGeometry args={[0.08, 0.07, 0.03]} />
        </mesh>
        <mesh material={matBlack} position={[0, -0.08, -0.18]}>
          <boxGeometry args={[0.12, 0.03, 0.03]} />
        </mesh>
      </group>

    </group>
  )
}
