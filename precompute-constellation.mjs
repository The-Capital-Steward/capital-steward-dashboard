// precompute-constellation.mjs
// Run from project root: node precompute-constellation.mjs
// Output: public/data/constellation_positions.json
//
// Collision radius = nodeRadius(ev) only — no gap.
// This keeps canvas fill ~82% (feasible) while preventing visual overlap.
// Two nodes are separated by at least r_i + r_j center-to-center.
//
// Attraction strength is per-bucket (skew-derived) but raised significantly
// to restore the VL→VH diagonal shape against collision pressure.
//
// Encoding C — base opacity from loss rate — applied at render time in page.tsx.

import { forceSimulation, forceManyBody, forceCollide, forceX, forceY } from 'd3-force'
import { writeFileSync } from 'fs'

const W = 690, H = 440

// ─── Per-bucket attraction — skew-derived, strong enough to hold diagonal ─────
// Golden ratio decay — each step ≈ 0.618× previous. VH/VL ratio = 6.9×.
// Golden ratio decay — each step ≈ 0.618× previous
const BUCKET_ATTRACTION = {
  'Very High': 0.76,
  'High':      0.47,
  'Moderate':  0.29,
  'Low':       0.18,
  'Very Low':  0.11,
}

// ─── nodeRadius — must match page.tsx exactly ─────────────────────────────────
function makeNodeRadius(evLo, evHi) {
  const MIN_R = 1.1, MAX_R = 4.7
  return function(ev) {
    const t = Math.max(0, Math.min(1,
      (Math.log(Math.max(ev, evLo)) - Math.log(evLo)) /
      (Math.log(evHi) - Math.log(evLo))
    ))
    return MIN_R + t * (MAX_R - MIN_R)
  }
}

// ─── Diagonal mapping ─────────────────────────────────────────────────────────
function diagonalX(composite) { return W * (0.07 + 0.86 * (composite / 100)) }
function diagonalY(composite) { return H * (0.93 - 0.86 * (composite / 100)) }

// ─── LCG + node generation — must match page.tsx exactly ─────────────────────
function makeLCG(seed) {
  let s = seed >>> 0
  return function() {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function generateNodes(n = 5200) {
  const rng = makeLCG(31337)
  const gauss = () => {
    const u1 = rng(), u2 = rng()
    return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2)
  }
  const OAL_WEIGHTS = [
    ['FCF', 0.518], ['NI', 0.438], ['EBIT', 0.001], ['Revenue', 0.043],
  ]
  function randOal() {
    const r = rng(); let cum = 0
    for (const [oal, w] of OAL_WEIGHTS) { cum += w; if (r < cum) return oal }
    return 'Revenue'
  }
  const raw = Array.from({ length: n }, (_, i) => {
    const axis1 = Math.min(100, Math.max(0, rng() * 100))
    const axis2 = Math.min(100, Math.max(0, rng() * 100))
    const composite = (axis1 + axis2) / 2
    const ev = Math.exp(gauss() * 1.6 + 21.5)
    return { i, axis1, axis2, composite, ev, oal: randOal() }
  })
  const ranked = [...raw].sort((a, b) => a.composite - b.composite)
  const bucketOf = (rank) => {
    const pct = rank / n
    if (pct < 0.20) return 'Very Low'
    if (pct < 0.40) return 'Low'
    if (pct < 0.60) return 'Moderate'
    if (pct < 0.80) return 'High'
    return 'Very High'
  }
  const bucketMap = new Map(ranked.map((d, rank) => [d.i, bucketOf(rank)]))
  return raw.map(d => ({
    id: `N${d.i}`,
    bucket: bucketMap.get(d.i),
    composite: d.composite,
    ev: d.ev,
    oal: d.oal,
  }))
}

// ─── Build ────────────────────────────────────────────────────────────────────

console.log('Generating 5,200 nodes...')
const nodes = generateNodes(5200)

const evSorted = [...nodes].map(n => n.ev).sort((a, b) => a - b)
const evLo = evSorted[Math.floor(evSorted.length * 0.03)]
const evHi = evSorted[Math.floor(evSorted.length * 0.97)]
const nodeRadius = makeNodeRadius(evLo, evHi)

// Pre-compute per-node radius for collision
nodes.forEach(n => {
  n.x  = diagonalX(n.composite)
  n.y  = diagonalY(n.composite)
  n.cr = nodeRadius(n.ev)  // collision radius = visual radius only — keeps fill at ~82% of canvas
})

console.log(`  EV bounds: $${(evLo/1e9).toFixed(1)}B → $${(evHi/1e9).toFixed(1)}B`)
console.log(`  Visual radius: ${nodeRadius(evLo).toFixed(1)}px → ${nodeRadius(evHi).toFixed(1)}px`)
console.log(`  Canvas fill estimate: ~82%`)
console.log(`\n  Attraction by bucket:`)
Object.entries(BUCKET_ATTRACTION).forEach(([b, a]) => {
  console.log(`    ${b.padEnd(12)}: ${a.toFixed(2)}`)
})

// Soft boundary — wider zone, stronger push
const WALL = 44
function boundaryForce() {
  return function() {
    for (const n of nodes) {
      if (n.x < WALL)     n.vx += (WALL - n.x)     * 0.42
      if (n.x > W - WALL) n.vx -= (n.x - (W-WALL)) * 0.42
      if (n.y < WALL)     n.vy += (WALL - n.y)     * 0.42
      if (n.y > H - WALL) n.vy -= (n.y - (H-WALL)) * 0.42
    }
  }
}

console.log('\nRunning force simulation (800 ticks)...')
const sim = forceSimulation(nodes)
  // charge disabled — testing collision-only separation
  //.force('charge', forceManyBody().strength(-0.3))
  .force('collide',  forceCollide(n => n.cr).strength(1.0).iterations(3))
  .force('x',        forceX(n => diagonalX(n.composite)).strength(n => BUCKET_ATTRACTION[n.bucket]))
  .force('y',        forceY(n => diagonalY(n.composite)).strength(n => BUCKET_ATTRACTION[n.bucket]))
  .force('boundary', boundaryForce())
  .alphaDecay(0.008)
  .stop()

for (let i = 0; i < 800; i++) {
  sim.tick()
  if (i % 100 === 99) console.log(`  ${i + 1} ticks complete`)
}

const MARGIN = 8
const positions = nodes.map(n => ({
  id: n.id,
  x: Math.round(Math.max(MARGIN, Math.min(W - MARGIN, n.x)) * 10) / 10,
  y: Math.round(Math.max(MARGIN, Math.min(H - MARGIN, n.y)) * 10) / 10,
}))

writeFileSync('public/data/constellation_positions.json', JSON.stringify(positions))
console.log(`\n✓ Written ${positions.length} positions`)
console.log(`\nEncoding C opacity at render time: VH=0.92  H=0.75  M=0.58  L=0.50  VL=0.42`)
