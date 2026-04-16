// precompute-constellation.mjs
// Run from project root: node precompute-constellation.mjs
// Output: public/data/constellation_positions.json

import { forceSimulation, forceManyBody, forceCollide, forceX, forceY } from 'd3-force'
import { writeFileSync } from 'fs'

const W = 542, H = 440

// 24%/76% margins — composite 0 → bottom-left, composite 100 → top-right
function diagonalX(composite) { return W * (0.24 + 0.52 * (composite / 100)) }
function diagonalY(composite) { return H * (0.76 - 0.52 * (composite / 100)) }

function makeLCG(seed) {
  let s = seed >>> 0
  return function () {
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
    return { i, axis1, axis2, composite, ev, oal: randOal(), mc: ev * (0.65 + rng() * 0.7) }
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

console.log('Generating 5,200 nodes...')
const nodes = generateNodes(5200)

nodes.forEach(n => {
  n.x = diagonalX(n.composite)
  n.y = diagonalY(n.composite)
})

console.log('Running force simulation (800 ticks)...')
const sim = forceSimulation(nodes)
  .force('charge',  forceManyBody().strength(-0.4))
  .force('collide', forceCollide(4.2).strength(1.0).iterations(3))
  .force('x', forceX(n => diagonalX(n.composite)).strength(0.29))
  .force('y', forceY(n => diagonalY(n.composite)).strength(0.29))
  .alphaDecay(0.008)
  .stop()

for (let i = 0; i < 800; i++) {
  sim.tick()
  if (i % 100 === 99) console.log(`  ${i + 1} ticks complete`)
}

const MARGIN = 20
const positions = nodes.map(n => ({
  id: n.id,
  x: Math.round(Math.max(MARGIN, Math.min(W - MARGIN, n.x)) * 10) / 10,
  y: Math.round(Math.max(MARGIN, Math.min(H - MARGIN, n.y)) * 10) / 10,
}))

writeFileSync('public/data/constellation_positions.json', JSON.stringify(positions))
console.log(`✓ Written ${positions.length} positions to public/data/constellation_positions.json`)
