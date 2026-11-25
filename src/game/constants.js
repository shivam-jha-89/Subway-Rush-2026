export const LANES = [-4, 0, 4]

export const INITIAL_SPEED = 16
export const MAX_SPEED_INCREASE = 18
export const SPEED_RAMP_DISTANCE = 5000

export const JUMP_VELOCITY = 14
export const GRAVITY_UP = 28
export const GRAVITY_DOWN = 44
export const TRAIN_ROOF_Y = 3.6
export const CEILING_HEIGHT = 3.5

export const JUMP_CUT_MULTIPLIER = 2.5
export const COYOTE_TIME = 0.1
export const JUMP_BUFFER_TIME = 0.15

export const TRAIN_CAR_LENGTH = 14
export const TRAIN_CAR_GAP = 6

export const TRAIN_VARIANTS = {
  normal:  { length: 14, width: 3.0, height: 4.0 },
  tall:    { length: 14, width: 3.0, height: 5.2 },
  wide:    { length: 18, width: 3.0, height: 4.0 },
  compact: { length: 10, width: 3.0, height: 4.0 },
}

export const OBSTACLE_SPAWN_DISTANCE = 100
export const OBSTACLE_SPAWN_INTERVAL = 22
export const COIN_SPAWN_INTERVAL = 18
export const COIN_SPAWN_DISTANCE = 80

export const LANE_COLLISION_TOLERANCE = 0.4
export const Z_COLLISION_BUFFER = 1
export const BARRIER_Z_BUFFER = 0.5
export const COIN_COLLECT_RADIUS = 1.8

export const NUM_PILLARS = 8
export const PILLAR_SPACING = 28

export const NUM_TIES_PER_TRACK = 50
export const TIE_SPACING = 2.4
export const TIE_WIDTH = 2.0
export const TRACK_CENTERS = [-4, 0, 4]

export const WALL_WORDS = [
  "SURF", "RUN", "JUMP", "DODGE", "KEEP MOVING",
  "CAN'T STOP", "WON'T STOP", "GRIND", "MOVE", "DASH",
]

export const WALL_FRAGMENTS = [
  "SURF", "RUN", "JUMP", "GRIND", "DODGE", "DASH", "GO",
  "CHASE", "MOVE", "BREAK", "HIGH", "FAST", "RAIL",
]
