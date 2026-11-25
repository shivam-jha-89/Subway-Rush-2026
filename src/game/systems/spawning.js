import {
  OBSTACLE_SPAWN_DISTANCE,
  COIN_SPAWN_DISTANCE,
  TRAIN_CAR_LENGTH,
  TRAIN_CAR_GAP,
  TRAIN_VARIANTS
} from '../constants'

const PATTERNS = [
  // Single obstacle — always escapable by switching to any other lane
  { name: 'single_left_train',     obstacles: [{ lane: -1, type: 'train',   zOffset: 0 }] },
  { name: 'single_middle_train',   obstacles: [{ lane:  0, type: 'train',   zOffset: 0 }] },
  { name: 'single_right_train',    obstacles: [{ lane:  1, type: 'train',   zOffset: 0 }] },
  { name: 'single_left_barrier',   obstacles: [{ lane: -1, type: 'barrier', zOffset: 0 }] },
  { name: 'single_middle_barrier', obstacles: [{ lane:  0, type: 'barrier', zOffset: 0 }] },
  { name: 'single_right_barrier',  obstacles: [{ lane:  1, type: 'barrier', zOffset: 0 }] },

  // Two obstacles — always exactly ONE completely clear lane
  { name: 'left_right_trains',     obstacles: [{ lane: -1, type: 'train',   zOffset: 0 }, { lane: 1, type: 'train', zOffset: 0 }] },
  { name: 'left_middle_barriers',  obstacles: [{ lane: -1, type: 'barrier', zOffset: 0 }, { lane: 0, type: 'barrier', zOffset: 0 }] },
  { name: 'middle_right_barriers', obstacles: [{ lane:  0, type: 'barrier', zOffset: 0 }, { lane: 1, type: 'barrier', zOffset: 0 }] },
  { name: 'left_right_barriers',   obstacles: [{ lane: -1, type: 'barrier', zOffset: 0 }, { lane: 1, type: 'barrier', zOffset: 0 }] },

  // Sequential — obstacles staggered so player has time to react and move
  { name: 'train_left_then_barrier_mid',   obstacles: [{ lane: -1, type: 'train',   zOffset: 0 }, { lane:  0, type: 'barrier', zOffset: 28 }] },
  { name: 'train_right_then_barrier_mid',  obstacles: [{ lane:  1, type: 'train',   zOffset: 0 }, { lane:  0, type: 'barrier', zOffset: 28 }] },
  { name: 'train_mid_then_barrier_left',   obstacles: [{ lane:  0, type: 'train',   zOffset: 0 }, { lane: -1, type: 'barrier', zOffset: 28 }] },
  { name: 'train_mid_then_barrier_right',  obstacles: [{ lane:  0, type: 'train',   zOffset: 0 }, { lane:  1, type: 'barrier', zOffset: 28 }] },

  // Zigzag — player has to weave, but always one lane open at each obstacle
  { name: 'zigzag_barriers_LRM',   obstacles: [{ lane: -1, type: 'barrier', zOffset: 0 }, { lane: 1, type: 'barrier', zOffset: 20 }, { lane: 0, type: 'barrier', zOffset: 40 }] },
  { name: 'zigzag_barriers_RLM',   obstacles: [{ lane:  1, type: 'barrier', zOffset: 0 }, { lane:-1, type: 'barrier', zOffset: 20 }, { lane: 0, type: 'barrier', zOffset: 40 }] },

  // Long trains — one lane blocked for longer, other two open
  { name: 'long_train_left',    obstacles: [{ lane: -1, type: 'train', zOffset: 0, numCars: 2 }] },
  { name: 'long_train_right',   obstacles: [{ lane:  1, type: 'train', zOffset: 0, numCars: 2 }] },
  { name: 'long_train_middle',  obstacles: [{ lane:  0, type: 'train', zOffset: 0, numCars: 2 }] },
]

let lastOpenLane = 0
let patternHistory = []
let nextId = 0

function pickVariant(lane) {
  if (lane === 0) {
    const shortVariants = ['wide', 'compact']
    return shortVariants[Math.floor(Math.random() * shortVariants.length)]
  }
  const variants = ['normal', 'tall', 'wide', 'compact']
  return variants[Math.floor(Math.random() * variants.length)]
}

function getBlockedLanes(pattern) {
  const lanes = new Set()
  for (const obs of pattern.obstacles) {
    lanes.add(obs.lane)
  }
  return lanes
}

function getOpenLanes(pattern) {
  const blocked = getBlockedLanes(pattern)
  return [-1, 0, 1].filter(l => !blocked.has(l))
}

function isPatternCompatible(pattern) {
  const openLanes = getOpenLanes(pattern)

  // Prevent same pattern 3 times in a row
  if (patternHistory.length >= 2 &&
      patternHistory[patternHistory.length - 1] === pattern.name &&
      patternHistory[patternHistory.length - 2] === pattern.name) return false

  if (openLanes.length === 0) return false

  // Allow any pattern where at least one open lane is reachable in 1 move
  for (const open of openLanes) {
    if (Math.abs(open - lastOpenLane) <= 1) return true
  }

  return false
}

function selectPattern() {
  const shuffled = [...PATTERNS].sort(() => Math.random() - 0.5)

  for (const pattern of shuffled) {
    if (isPatternCompatible(pattern)) {
      return pattern
    }
  }

  const safeLane = lastOpenLane
  return {
    name: 'fallback_single',
    obstacles: [{ lane: safeLane === 0 ? 1 : 0, type: 'barrier', zOffset: 0 }]
  }
}

export function spawnObstacles(obstacles, worldZ) {
  const spawnZ = -OBSTACLE_SPAWN_DISTANCE - worldZ
  const pattern = selectPattern()

  patternHistory.push(pattern.name)
  if (patternHistory.length > 10) patternHistory.shift()

  for (const obs of pattern.obstacles) {
    const obstacle = {
      id: nextId++,
      lane: obs.lane,
      z: spawnZ - obs.zOffset,
      type: obs.type,
      oncoming: false,
    }

    if (obs.type === 'train') {
      obstacle.numCars = obs.numCars || 1
      obstacle.variant = pickVariant(obs.lane)
    }

    obstacles.push(obstacle)
  }

  // Oncoming train — increased to 25% chance, needs ≥2 open lanes
  const openLanesForOncoming = getOpenLanes(pattern)
  if (openLanesForOncoming.length >= 2 && Math.random() < 0.25) {
    const lane = openLanesForOncoming[Math.floor(Math.random() * openLanesForOncoming.length)]
    obstacles.push({
      id: nextId++,
      lane,
      z: spawnZ - 40,   // spawn further ahead so player has more time to react
      type: 'train',
      oncoming: true,
      numCars: 1,
      variant: pickVariant(lane),
    })
  }

  const openLanes = getOpenLanes(pattern)
  lastOpenLane = openLanes.reduce((closest, lane) =>
    Math.abs(lane - lastOpenLane) < Math.abs(closest - lastOpenLane) ? lane : closest
  , openLanes[0])
}

export function resetSpawnState() {
  lastOpenLane = 0
  patternHistory = []
  nextId = 0
}

export function spawnCoins(coins, obstacles, worldZ) {
  const spawnZ = -COIN_SPAWN_DISTANCE - worldZ
  const lane = Math.floor(Math.random() * 3) - 1
  const numCoins = 3 + Math.floor(Math.random() * 4)
  const coinSpacing = 3
  const coinLineLength = (numCoins - 1) * coinSpacing

  let trainInLane = null
  let barrierInLane = null

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i]
    if (obs.lane !== lane) continue

    if (obs.type === 'train') {
      const variant = obs.variant || 'normal'
      const variantLength = TRAIN_VARIANTS[variant]?.length || TRAIN_CAR_LENGTH
      const trainLength = obs.numCars * (variantLength + TRAIN_CAR_GAP)
      const trainFrontZ = obs.z + variantLength / 2
      const trainBackZ = obs.z - trainLength + variantLength / 2
      const coinsFrontZ = spawnZ
      const coinsBackZ = spawnZ - coinLineLength

      if (trainFrontZ > coinsBackZ - 10 && trainBackZ < coinsFrontZ + 10) {
        trainInLane = obs
      }
    } else if (obs.type === 'barrier') {
      const barrierZ = obs.z
      const coinsFrontZ = spawnZ + 5
      const coinsBackZ = spawnZ - coinLineLength - 5

      if (barrierZ < coinsFrontZ && barrierZ > coinsBackZ) {
        barrierInLane = obs
      }
    }
  }

  if (barrierInLane) {
    // Arc coins over barrier — but keep them low, max 1.8 height
    const barrierZ = barrierInLane.z
    const arcNumCoins = 5
    const arcSpread = 10
    const groundHeight = 1.2
    const peakHeight = 1.8   // max arc height — still reachable without big jump

    for (let i = 0; i < arcNumCoins; i++) {
      const t = i / (arcNumCoins - 1)
      const coinZ = barrierZ + (arcSpread / 2) - (t * arcSpread)
      const arcProgress = 4 * t * (1 - t)
      const coinY = groundHeight + arcProgress * peakHeight
      coins.push({ id: nextId++, lane, z: coinZ, y: coinY, collected: false })
    }
    return
  }

  // All other coins — strictly ground level
  const coinHeight = 1.2

  for (let i = 0; i < numCoins; i++) {
    coins.push({ id: nextId++, lane, z: spawnZ - i * coinSpacing, y: coinHeight, collected: false })
  }
}
