'use client'

import { Pause, Play, RotateCcw, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type Kind = 'byte' | 'bug' | 'star'
type Drop = { x: number; y: number; vy: number; r: number; kind: Kind; label: string; spin: number }
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string }
type Status = 'ready' | 'playing' | 'paused' | 'over'

const W = 640
const H = 480
const COLORS: Record<Kind, string> = { byte: '#2d7cf6', bug: '#f43f5e', star: '#facc15' }

function readBest() {
  try { return Number(localStorage.getItem('ob-byte-best')) || 0 } catch { return 0 }
}

/**
 * Byte Catcher: steer the collector to catch falling bytes, dodge bugs, grab stars for an extra life.
 * Mouse, touch and arrow keys all work; the loop pauses when the tab is hidden.
 */
export function ByteGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<Status>('ready')
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, best: 0 })
  const game = useRef({
    paddle: W / 2, target: W / 2, drops: [] as Drop[], particles: [] as Particle[],
    score: 0, lives: 3, level: 1, spawn: 0, combo: 0, shake: 0, keys: { left: false, right: false }, status: 'ready' as Status, last: 0,
  })

  useEffect(() => { setHud((h) => ({ ...h, best: readBest() })) }, [])

  const setGameStatus = useCallback((next: Status) => { game.current.status = next; setStatus(next) }, [])

  const start = useCallback(() => {
    Object.assign(game.current, { paddle: W / 2, target: W / 2, drops: [], particles: [], score: 0, lives: 3, level: 1, spawn: 0, combo: 0, shake: 0, last: performance.now() })
    setHud((h) => ({ ...h, score: 0, lives: 3, level: 1 }))
    setGameStatus('playing')
  }, [setGameStatus])

  const togglePause = useCallback(() => {
    const s = game.current.status
    if (s === 'playing') setGameStatus('paused')
    else if (s === 'paused') { game.current.last = performance.now(); setGameStatus('playing') }
  }, [setGameStatus])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const g = game.current
    const stars = Array.from({ length: 60 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 1.5 + .3, v: Math.random() * 12 + 4 }))
    let raf = 0

    const burst = (x: number, y: number, color: string, n = 14) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const s = Math.random() * 180 + 60
        g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 1, color })
      }
    }

    const spawn = () => {
      const roll = Math.random()
      const kind: Kind = roll < 0.05 ? 'star' : roll < 0.05 + Math.min(0.18 + g.level * 0.03, 0.4) ? 'bug' : 'byte'
      const r = kind === 'byte' ? 16 : 17
      g.drops.push({
        x: r + Math.random() * (W - r * 2), y: -r, r, kind,
        vy: 110 + g.level * 22 + Math.random() * 50,
        label: kind === 'byte' ? (Math.random() < 0.5 ? '1' : '0') : kind === 'bug' ? '✕' : '★',
        spin: Math.random() * Math.PI,
      })
    }

    const update = (dt: number) => {
      if (g.keys.left) g.target -= 520 * dt
      if (g.keys.right) g.target += 520 * dt
      g.target = Math.max(50, Math.min(W - 50, g.target))
      g.paddle += (g.target - g.paddle) * Math.min(1, dt * 14)

      g.spawn -= dt
      if (g.spawn <= 0) { spawn(); g.spawn = Math.max(0.28, 0.9 - g.level * 0.06) }

      const py = H - 46
      for (let i = g.drops.length - 1; i >= 0; i--) {
        const d = g.drops[i]
        d.y += d.vy * dt
        d.spin += dt * 2
        const caught = d.y + d.r > py - 8 && d.y - d.r < py + 12 && Math.abs(d.x - g.paddle) < 54 + d.r * 0.4
        if (caught) {
          g.drops.splice(i, 1)
          if (d.kind === 'byte') { g.combo += 1; g.score += 10 * Math.min(1 + Math.floor(g.combo / 5), 5); burst(d.x, py, COLORS.byte) }
          else if (d.kind === 'star') { g.lives = Math.min(g.lives + 1, 5); g.score += 50; burst(d.x, py, COLORS.star, 24) }
          else { g.lives -= 1; g.combo = 0; g.shake = 0.35; burst(d.x, py, COLORS.bug, 22) }
          continue
        }
        if (d.y - d.r > H) {
          g.drops.splice(i, 1)
          if (d.kind === 'byte') g.combo = 0
        }
      }
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i]
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; p.life -= dt * 1.6
        if (p.life <= 0) g.particles.splice(i, 1)
      }
      g.shake = Math.max(0, g.shake - dt)
      g.level = 1 + Math.floor(g.score / 250)
      for (const s of stars) { s.y += s.v * dt; if (s.y > H) { s.y = 0; s.x = Math.random() * W } }

      if (g.lives <= 0) {
        const best = Math.max(readBest(), g.score)
        try { localStorage.setItem('ob-byte-best', String(best)) } catch { /* ignore */ }
        setHud({ score: g.score, lives: 0, level: g.level, best })
        setGameStatus('over')
      }
    }

    const draw = (t: number) => {
      ctx.save()
      ctx.clearRect(0, 0, W, H)
      if (g.shake > 0) ctx.translate((Math.random() - .5) * 10 * g.shake * 3, (Math.random() - .5) * 10 * g.shake * 3)
      for (const s of stars) { ctx.fillStyle = `rgba(148,170,200,${0.25 + s.s * 0.25})`; ctx.fillRect(s.x, s.y, s.s, s.s) }

      ctx.strokeStyle = 'rgba(45,124,246,.08)'
      ctx.lineWidth = 1
      for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }

      for (const d of g.drops) {
        ctx.save()
        ctx.translate(d.x, d.y)
        ctx.shadowColor = COLORS[d.kind]
        ctx.shadowBlur = 18
        if (d.kind === 'byte') {
          ctx.fillStyle = COLORS.byte
          ctx.beginPath(); ctx.roundRect(-d.r, -d.r, d.r * 2, d.r * 2, 7); ctx.fill()
        } else if (d.kind === 'bug') {
          ctx.rotate(Math.sin(d.spin) * 0.3)
          ctx.fillStyle = COLORS.bug
          ctx.beginPath(); ctx.arc(0, 0, d.r, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = COLORS.bug; ctx.lineWidth = 2
          for (const side of [-1, 1]) for (const k of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(side * d.r * 0.8, k); ctx.lineTo(side * (d.r + 7), k + side * 3); ctx.stroke() }
        } else {
          ctx.rotate(d.spin)
          ctx.fillStyle = COLORS.star
          ctx.beginPath()
          for (let i = 0; i < 10; i++) { const r = i % 2 ? d.r * 0.45 : d.r; const a = (i / 10) * Math.PI * 2 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) }
          ctx.closePath(); ctx.fill()
        }
        ctx.shadowBlur = 0
        if (d.kind !== 'star') {
          ctx.rotate(0)
          ctx.fillStyle = '#fff'
          ctx.font = '700 15px ui-monospace, monospace'
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
          ctx.fillText(d.label, 0, 1)
        }
        ctx.restore()
      }

      for (const p of g.particles) { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.fillRect(p.x - 2, p.y - 2, 4, 4) }
      ctx.globalAlpha = 1

      const py = H - 46
      const glow = ctx.createLinearGradient(g.paddle - 60, 0, g.paddle + 60, 0)
      glow.addColorStop(0, '#2d7cf6'); glow.addColorStop(.5, '#22d3ee'); glow.addColorStop(1, '#8b5cf6')
      ctx.shadowColor = '#22d3ee'
      ctx.shadowBlur = 24 + Math.sin(t / 200) * 6
      ctx.fillStyle = glow
      ctx.beginPath(); ctx.roundRect(g.paddle - 54, py, 108, 14, 7); ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,.85)'
      ctx.font = '700 10px ui-monospace, monospace'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('OPULENCE', g.paddle, py + 7.5)

      if (g.combo >= 5) {
        ctx.fillStyle = 'rgba(34,211,238,.9)'
        ctx.font = '700 14px ui-monospace, monospace'
        ctx.fillText(`COMBO x${Math.min(1 + Math.floor(g.combo / 5), 5)}`, g.paddle, py - 22)
      }
      ctx.restore()
    }

    let hudTick = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.033, (t - g.last) / 1000 || 0)
      g.last = t
      if (g.status === 'playing') {
        update(dt)
        hudTick += dt
        if (hudTick > 0.1) { hudTick = 0; setHud((h) => ({ ...h, score: g.score, lives: g.lives, level: g.level })) }
      }
      draw(t)
    }
    raf = requestAnimationFrame(loop)

    const toLocal = (clientX: number) => {
      const rect = canvas.getBoundingClientRect()
      return ((clientX - rect.left) / rect.width) * W
    }
    const onPointer = (e: PointerEvent) => { g.target = toLocal(e.clientX) }
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') { g.keys.left = down; if (g.status === 'playing') e.preventDefault() }
      if (e.key === 'ArrowRight' || e.key === 'd') { g.keys.right = down; if (g.status === 'playing') e.preventDefault() }
      if (down && (e.key === 'p' || e.key === 'P')) togglePause()
    }
    const keydown = (e: KeyboardEvent) => onKey(e, true)
    const keyup = (e: KeyboardEvent) => onKey(e, false)
    const onHide = () => { if (document.hidden && g.status === 'playing') setGameStatus('paused') }

    canvas.addEventListener('pointermove', onPointer)
    canvas.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onPointer)
      canvas.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [setGameStatus, togglePause])

  return (
    <div className="card game-wrap">
      <div className="game-hud">
        <span>SCORE <b>{hud.score}</b></span>
        <span>LVL <b>{hud.level}</b></span>
        <span className="lives" aria-label={`${hud.lives} lives`}>{'♥'.repeat(Math.max(0, hud.lives))}</span>
        <span><Trophy size={12} style={{ verticalAlign: -1 }} /> <b>{hud.best}</b></span>
        {(status === 'playing' || status === 'paused') && (
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={togglePause} aria-label={status === 'paused' ? 'Resume' : 'Pause'}>
            {status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="game-canvas" width={W} height={H} aria-label="Byte Catcher game" />
      {status !== 'playing' && (
        <div className="game-overlay">
          <div>
            {status === 'ready' && <><h3>Byte Catcher</h3><p>Catch the blue bytes, dodge the red bugs and grab gold stars for an extra life. Speed rises every 250 points.</p></>}
            {status === 'paused' && <><h3>Paused</h3><p>Take a breather. Your bytes will wait.</p></>}
            {status === 'over' && <><h3>Game over</h3><p>You scored <b>{hud.score}</b> points{hud.score > 0 && hud.score >= hud.best ? ', a new best!' : `. Best: ${hud.best}.`}</p></>}
            <button className="btn btn-primary" onClick={status === 'paused' ? togglePause : start}>
              {status === 'paused' ? <><Play size={16} /> Resume</> : status === 'over' ? <><RotateCcw size={16} /> Play again</> : <><Play size={16} /> Start game</>}
            </button>
            <div className="game-keys"><span>Move with mouse, touch or <kbd>←</kbd> <kbd>→</kbd></span><span><kbd>P</kbd> pause</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
