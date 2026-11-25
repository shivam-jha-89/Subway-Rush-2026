import * as THREE from 'three'

export const pinkWireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0xFF69B4,
  wireframe: true
})

export const baseFillMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1
})

export const blackMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true
})

export const grayMaterial = new THREE.MeshBasicMaterial({
  color: 0x4a4a4a,
  side: THREE.DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1
})

export const grayWireframeMaterial = new THREE.MeshBasicMaterial({
  color: 0x2a2a2a,
  wireframe: true
})

export const wireframeOverlayMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true
})

export const pureBlackMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000
})
