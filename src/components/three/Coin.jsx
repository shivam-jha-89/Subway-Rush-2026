import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Low-poly coin — 10 segments instead of 28, star replaced with simple cross boxes
const R = 0.52

const matGold   = new THREE.MeshBasicMaterial({ color: 0xFFCC00 })
const matOrange = new THREE.MeshBasicMaterial({ color: 0xBB4400 })
const matStar   = new THREE.MeshBasicMaterial({ color: 0xFFFF88 })
const matEdge   = new THREE.MeshBasicMaterial({ color: 0xDD9900 })

const gDisc  = new THREE.CylinderGeometry(R, R, 0.14, 10)
const gInner = new THREE.CylinderGeometry(R * 0.68, R * 0.68, 0.20, 10)
const gEdge  = new THREE.CylinderGeometry(R + 0.05, R + 0.05, 0.08, 10)
// Star replaced with 2 crossed boxes — negligible vertex count
const gStarH = new THREE.BoxGeometry(R * 0.90, 0.26, R * 0.18)
const gStarV = new THREE.BoxGeometry(R * 0.18, 0.26, R * 0.90)

export function Coin({ coinRef }) {
  const ref = useRef()
  if (coinRef) coinRef._mesh = ref

  // No useFrame — GameScene handles position AND spin via _mesh ref

  return (
    <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <mesh geometry={gDisc}  material={matGold} />
      <mesh geometry={gEdge}  material={matEdge} />
      <mesh geometry={gInner} material={matOrange} />
      <mesh geometry={gStarH} material={matStar} position={[0, 0.08, 0]} />
      <mesh geometry={gStarV} material={matStar} position={[0, 0.08, 0]} />
    </group>
  )
}
