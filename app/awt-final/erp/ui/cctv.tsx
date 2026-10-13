'use client'

import { useEffect, useRef } from 'react'

/**
 * Simulated CCTV feeds, drawn live on canvas: moving people, cars and
 * blinking monitors with grain and scanlines. Nothing is downloaded, so the
 * demo footage is royalty-free by construction. One animation loop at ~12 fps
 * drives every visible camera and pauses when the tab is hidden.
 */

export type Scene = 'corridor' | 'lobby' | 'parking' | 'entrance' | 'counter' | 'icu' | 'lift' | 'stairs'
export type Camera = { id: string; name: string; location: string; scene: Scene; seed: number }

export const CAMERAS: Camera[] = [
  { id: 'CAM-01', name: 'Emergency entrance', location: 'Ground floor, ambulance bay', scene: 'entrance', seed: 1 },
  { id: 'CAM-02', name: 'Main lobby', location: 'Ground floor, reception', scene: 'lobby', seed: 2 },
  { id: 'CAM-03', name: 'Billing counter', location: 'Ground floor', scene: 'counter', seed: 3 },
  { id: 'CAM-04', name: 'Pharmacy', location: 'Ground floor', scene: 'counter', seed: 4 },
  { id: 'CAM-05', name: 'Lift lobby 2', location: 'All floors', scene: 'lift', seed: 5 },
  { id: 'CAM-06', name: '2nd floor corridor', location: 'Wards', scene: 'corridor', seed: 6 },
  { id: 'CAM-07', name: 'NICU corridor', location: '3rd floor, restricted', scene: 'corridor', seed: 7 },
  { id: 'CAM-08', name: 'Medical ICU', location: '1st floor', scene: 'icu', seed: 8 },
  { id: 'CAM-09', name: 'Visitor parking', location: 'Outdoor, east gate', scene: 'parking', seed: 9 },
  { id: 'CAM-10', name: 'OT complex entry', location: '1st floor, restricted', scene: 'corridor', seed: 10 },
  { id: 'CAM-11', name: 'Fire exit stairs B', location: 'Stairwell', scene: 'stairs', seed: 11 },
  { id: 'CAM-12', name: 'Staff parking', location: 'Basement', scene: 'parking', seed: 12 },
]

const W = 320, H = 200
type Agent = { x: number; y: number; vx: number; vy: number; s: number; kind: 'person' | 'car' | 'bed'; shade: number; phase: number }
type Feed = { ctx: CanvasRenderingContext2D; cam: Camera; agents: Agent[]; t: number }

const feeds = new Set<Feed>()
let raf = 0, last = 0
let noise: HTMLCanvasElement | null = null

function makeNoise() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const x = c.getContext('2d')!
  const img = x.createImageData(128, 128)
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255 }
  x.putImageData(img, 0, 0)
  return c
}

function rand(seed: number) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280) }

function spawn(cam: Camera): Agent[] {
  const r = rand(cam.seed)
  const n = cam.scene === 'parking' ? 4 : cam.scene === 'icu' ? 3 : cam.scene === 'stairs' ? 1 : 5
  return Array.from({ length: n }, (_, i) => {
    if (cam.scene === 'parking' || (cam.scene === 'entrance' && i === 0)) return { x: r() * W, y: cam.scene === 'entrance' ? 140 : 70 + (i % 2) * 70, vx: (r() > .5 ? 1 : -1) * (12 + r() * 14), vy: 0, s: 1, kind: 'car', shade: 120 + r() * 100, phase: 0 }
    if (cam.scene === 'icu') return { x: 50 + i * 100, y: 120, vx: 0, vy: 0, s: 1, kind: 'bed', shade: 180, phase: r() * 6 }
    if (cam.scene === 'corridor' || cam.scene === 'lift') return { x: 140 + r() * 40, y: 80 + r() * 100, vx: (r() - .5) * 6, vy: (r() > .5 ? 1 : -1) * (6 + r() * 8), s: 1, kind: 'person', shade: 60 + r() * 140, phase: r() * 6 }
    return { x: r() * W, y: 110 + r() * 70, vx: (r() > .5 ? 1 : -1) * (8 + r() * 14), vy: (r() - .5) * 3, s: 1, kind: 'person', shade: 60 + r() * 140, phase: r() * 6 }
  })
}

function drawBackground(g: CanvasRenderingContext2D, scene: Scene) {
  const grd = g.createLinearGradient(0, 0, 0, H)
  grd.addColorStop(0, '#2a2f2c'); grd.addColorStop(1, '#4a514c')
  g.fillStyle = grd; g.fillRect(0, 0, W, H)
  g.strokeStyle = 'rgba(200,210,200,.18)'; g.lineWidth = 1
  if (scene === 'corridor' || scene === 'lift' || scene === 'stairs') {
    // vanishing point perspective
    const vx = 160, vy = 70
    g.fillStyle = '#1f2421'; g.fillRect(vx - 34, vy - 30, 68, 46)
    for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(vx + (x ? 34 : -34), vy + (y ? 16 : -30)); g.stroke() }
    for (let i = 0; i < 5; i++) { const k = i / 5; g.beginPath(); g.moveTo(vx - 34 - k * 126, vy + 16 + k * 114); g.lineTo(vx + 34 + k * 126, vy + 16 + k * 114); g.stroke() }
    g.fillStyle = 'rgba(230,240,230,.25)'
    for (let i = 0; i < 3; i++) { const k = (i + 1) / 4; g.fillRect(vx - 10 - k * 20, vy - 30 - k * 60, 20 + k * 40, 3) }
    if (scene === 'lift') { g.fillStyle = '#5b625d'; g.fillRect(30, 40, 60, 110); g.fillRect(230, 40, 60, 110); g.strokeRect(60, 40, 0.1, 110); g.strokeRect(260, 40, 0.1, 110) }
    if (scene === 'stairs') for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#3d443f' : '#4a524c'; g.fillRect(40 + i * 8, 190 - i * 14, 240 - i * 16, 14) }
  } else if (scene === 'parking' || scene === 'entrance') {
    g.fillStyle = '#353b37'; g.fillRect(0, 50, W, H)
    g.strokeStyle = 'rgba(230,230,200,.35)'
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(i * 40, 50); g.lineTo(i * 40 - 20, 100); g.stroke(); g.beginPath(); g.moveTo(i * 40, 190); g.lineTo(i * 40 + 20, 160); g.stroke() }
    g.fillStyle = '#20251f'; g.fillRect(0, 0, W, 50)
    if (scene === 'entrance') { g.fillStyle = '#596059'; g.fillRect(200, 10, 110, 60); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(215, 25, 80, 8) }
  } else if (scene === 'icu') {
    g.fillStyle = '#3c423e'; g.fillRect(0, 0, W, 60)
    for (let i = 0; i < 3; i++) { g.fillStyle = '#262b28'; g.fillRect(30 + i * 100, 20, 42, 28) }
  } else {
    // lobby / counter
    g.fillStyle = '#3a403c'; g.fillRect(0, 0, W, 90)
    if (scene === 'counter') { g.fillStyle = '#5c635e'; g.fillRect(20, 70, 280, 30); g.fillStyle = '#272c29'; for (let i = 0; i < 4; i++) g.fillRect(40 + i * 70, 50, 34, 20) }
    else { g.fillStyle = '#5c635e'; g.fillRect(110, 60, 100, 26); for (let i = 0; i < 6; i++) { g.fillStyle = '#2b302d'; g.fillRect(20 + i * 50, 170, 30, 10) } }
  }
}

function drawAgent(g: CanvasRenderingContext2D, a: Agent, t: number, scene: Scene) {
  const c = Math.round(a.shade)
  if (a.kind === 'car') {
    g.fillStyle = `rgb(${c},${c},${c})`
    g.fillRect(a.x - 26, a.y - 12, 52, 22); g.fillRect(a.x - 16, a.y - 22, 32, 12)
    g.fillStyle = '#111'; g.fillRect(a.x - 20, a.y + 8, 10, 6); g.fillRect(a.x + 10, a.y + 8, 10, 6)
    g.fillStyle = 'rgba(255,255,220,.8)'; g.fillRect(a.vx > 0 ? a.x + 24 : a.x - 27, a.y - 6, 3, 4)
    return
  }
  if (a.kind === 'bed') {
    g.fillStyle = '#9aa29c'; g.fillRect(a.x - 34, a.y - 10, 68, 26)
    g.fillStyle = '#c9cfca'; g.fillRect(a.x - 30, a.y - 16, 22, 10)
    const on = Math.sin(t * 3 + a.phase) > 0
    g.fillStyle = on ? 'rgba(150,255,170,.9)' : 'rgba(80,140,90,.6)'
    g.fillRect(a.x + 10, a.y - 74, 20, 14)
    g.strokeStyle = 'rgba(150,255,170,.8)'; g.beginPath()
    for (let i = 0; i < 18; i++) { const px = a.x + 11 + i, py = a.y - 67 + (i % 6 === 3 ? -5 : 0); i ? g.lineTo(px, py) : g.moveTo(px, py) } g.stroke()
    return
  }
  const depth = scene === 'corridor' || scene === 'lift' || scene === 'stairs' ? 0.35 + (a.y / H) * 0.9 : 1
  const h = 34 * depth, w = 11 * depth
  const bob = Math.sin(t * 8 + a.phase) * 1.2 * depth
  g.fillStyle = `rgb(${c},${c},${c})`
  g.beginPath(); g.ellipse(a.x, a.y - h + bob, w * 0.42, w * 0.5, 0, 0, Math.PI * 2); g.fill()
  g.fillRect(a.x - w / 2, a.y - h + w * 0.5 + bob, w, h * 0.55)
  const leg = Math.sin(t * 8 + a.phase) * 3 * depth
  g.fillRect(a.x - w / 2 + 1, a.y - h * 0.3, w * 0.35, h * 0.3 + leg)
  g.fillRect(a.x + w / 2 - w * 0.35 - 1, a.y - h * 0.3, w * 0.35, h * 0.3 - leg)
}

function step(f: Feed, dt: number) {
  f.t += dt
  for (const a of f.agents) {
    a.x += a.vx * dt; a.y += a.vy * dt
    if (a.kind === 'car') { if (a.x > W + 40) a.x = -40; if (a.x < -40) a.x = W + 40 }
    else if (a.kind === 'person') {
      if (f.cam.scene === 'corridor' || f.cam.scene === 'lift' || f.cam.scene === 'stairs') { if (a.y > H + 10) a.y = 80; if (a.y < 78) a.y = H + 8 }
      else { if (a.x > W + 10) a.x = -10; if (a.x < -10) a.x = W + 10; if (a.y < 100 || a.y > 190) a.vy *= -1 }
      if (f.cam.scene === 'counter' && Math.sin(f.t * 0.4 + a.phase) > 0.6) { a.x -= a.vx * dt }
    }
  }
}

function render(f: Feed) {
  const g = f.ctx
  drawBackground(g, f.cam.scene)
  const sorted = [...f.agents].sort((a, b) => a.y - b.y)
  for (const a of sorted) drawAgent(g, a, f.t, f.cam.scene)
  // grain + scanlines + vignette
  if (noise) { g.globalAlpha = 0.09; g.drawImage(noise, -Math.random() * 64, -Math.random() * 64, 256, 256); g.drawImage(noise, 128 - Math.random() * 64, 64 - Math.random() * 64, 256, 256); g.globalAlpha = 1 }
  g.fillStyle = 'rgba(0,0,0,.12)'
  for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1)
  const v = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 200)
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)')
  g.fillStyle = v; g.fillRect(0, 0, W, H)
  g.fillStyle = 'rgba(120,255,160,.05)'; g.fillRect(0, 0, W, H)
}

function loop(t: number) {
  raf = requestAnimationFrame(loop)
  if (document.hidden || t - last < 80) return
  const dt = Math.min(0.2, (t - last) / 1000)
  last = t
  feeds.forEach((f) => { step(f, dt); render(f) })
}

export function CctvCanvas({ cam }: { cam: Camera }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d', { alpha: false })
    if (!ctx) return
    if (!noise) noise = makeNoise()
    const f: Feed = { ctx, cam, agents: spawn(cam), t: cam.seed }
    render(f)
    feeds.add(f)
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop) }
    return () => { feeds.delete(f); if (!feeds.size) { cancelAnimationFrame(raf); raf = 0 } }
  }, [cam])
  return <canvas ref={ref} width={W} height={H} aria-label={`Live feed: ${cam.name}`} />
}
