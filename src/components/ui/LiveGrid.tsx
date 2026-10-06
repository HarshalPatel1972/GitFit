"use client"

import { useEffect, useRef } from "react"

/**
 * The living background: the product's idea, running quietly behind everything.
 * Faint tiles drift over a dot grid. Most glide into a grid cell, straighten and glow
 * volt (finding their place); some turn coral and drop away (clutter being put away).
 * On desktop the grid also brightens around the cursor.
 *
 * One canvas, ~30 fps, paused while the tab is hidden, and static for reduced motion.
 */

const CELL = 32
const VOLT = "212, 255, 58"
const CORAL = "255, 90, 54"
const CHALK = "242, 240, 235"

type Phase = "drift" | "settle" | "hold" | "fall" | "fade"

interface Tile {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  spin: number
  size: number
  alpha: number
  keep: boolean
  phase: Phase
  t: number // ms spent in the current phase
  driftFor: number
  holdFor: number
  fromX: number
  fromY: number
  fromAngle: number
  toX: number
  toY: number
}

const settings = {
  full: { tiles: 22, dotAlpha: 0.09, tileAlpha: 0.22, spotlight: true },
  subtle: { tiles: 9, dotAlpha: 0.05, tileAlpha: 0.12, spotlight: false },
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const easeOutBack = (t: number) => {
  const c = 1.4
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
}

export function LiveGrid({ intensity = "full" }: { intensity?: "full" | "subtle" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const cfg = settings[intensity]
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const finePointer = window.matchMedia("(pointer: fine)").matches
    let width = 0
    let height = 0
    let frame = 0
    let last = performance.now()
    const pointer = { x: -9999, y: -9999 }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function spawn(tile?: Tile): Tile {
      const keep = Math.random() < 0.68
      const t: Tile = tile ?? ({} as Tile)
      Object.assign(t, {
        x: rand(0, width),
        y: rand(-40, height),
        vx: rand(-0.012, 0.012),
        vy: rand(0.004, 0.018),
        angle: rand(-0.6, 0.6),
        spin: rand(-0.0004, 0.0004),
        size: rand(10, 16),
        alpha: 0,
        keep,
        phase: "drift" as Phase,
        t: 0,
        driftFor: rand(1800, 5200),
        holdFor: rand(2500, 6000),
      })
      return t
    }

    resize()
    const tiles = Array.from({ length: cfg.tiles }, () => {
      const t = spawn()
      t.t = rand(0, t.driftFor) // start mid-life so the page isn't empty at first
      return t
    })

    function step(t: Tile, dt: number) {
      t.t += dt
      switch (t.phase) {
        case "drift":
          t.x += t.vx * dt
          t.y += t.vy * dt
          t.angle += t.spin * dt
          t.alpha = Math.min(1, t.alpha + dt / 600)
          if (t.t > t.driftFor) {
            if (t.keep) {
              t.phase = "settle"
              t.fromX = t.x
              t.fromY = t.y
              t.fromAngle = t.angle
              t.toX = Math.round(t.x / CELL) * CELL + CELL / 2
              t.toY = Math.round(t.y / CELL) * CELL + CELL / 2
            } else {
              t.phase = "fall"
              t.vy = 0.02
            }
            t.t = 0
          }
          break
        case "settle": {
          const p = Math.min(1, t.t / 900)
          const e = easeOutBack(p)
          t.x = t.fromX + (t.toX - t.fromX) * e
          t.y = t.fromY + (t.toY - t.fromY) * e
          t.angle = t.fromAngle * (1 - e)
          if (p >= 1) {
            t.phase = "hold"
            t.t = 0
          }
          break
        }
        case "hold":
          if (t.t > t.holdFor) {
            t.phase = "fade"
            t.t = 0
          }
          break
        case "fall":
          t.vy += 0.00006 * dt
          t.y += t.vy * dt
          t.angle += 0.0012 * dt
          t.alpha = Math.max(0, t.alpha - dt / 1600)
          if (t.alpha <= 0 || t.y > height + 40) spawn(t)
          break
        case "fade":
          t.alpha = Math.max(0, t.alpha - dt / 900)
          if (t.alpha <= 0) spawn(t)
          break
      }
    }

    function drawDots() {
      const cols = Math.ceil(width / CELL) + 1
      const rows = Math.ceil(height / CELL) + 1
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * CELL
          const y = j * CELL
          let a = cfg.dotAlpha
          if (cfg.spotlight && finePointer) {
            const d = Math.hypot(x - pointer.x, y - pointer.y)
            if (d < 220) a += (1 - d / 220) * 0.35
          }
          ctx!.fillStyle = `rgba(${CHALK}, ${a})`
          ctx!.fillRect(x - 1, y - 1, 2, 2)
        }
      }
    }

    function drawTile(t: Tile) {
      const half = t.size / 2
      ctx!.save()
      ctx!.translate(t.x, t.y)
      ctx!.rotate(t.angle)
      const settledGlow = t.phase === "hold" ? Math.max(0.35, 1 - t.t / 1200) : t.phase === "settle" ? t.t / 900 : 0
      let stroke = `rgba(${CHALK}, ${cfg.tileAlpha * t.alpha})`
      let fill = "transparent"
      if (t.keep && (t.phase === "settle" || t.phase === "hold" || t.phase === "fade")) {
        stroke = `rgba(${VOLT}, ${(cfg.tileAlpha + 0.25 * settledGlow) * t.alpha * 1.6})`
        fill = `rgba(${VOLT}, ${0.18 * settledGlow * t.alpha})`
      } else if (t.phase === "fall") {
        stroke = `rgba(${CORAL}, ${cfg.tileAlpha * 1.4 * t.alpha})`
      }
      ctx!.beginPath()
      ctx!.roundRect(-half, -half, t.size, t.size, 2)
      ctx!.fillStyle = fill
      ctx!.fill()
      ctx!.strokeStyle = stroke
      ctx!.lineWidth = 1.2
      ctx!.stroke()
      ctx!.restore()
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height)
      drawDots()
      if (!reduceMotion) tiles.forEach(drawTile)
    }

    function loop(now: number) {
      const dt = Math.min(64, now - last)
      // ~30 fps is plenty for a background and halves the work
      if (dt >= 32) {
        last = now
        tiles.forEach((t) => step(t, dt))
        draw()
      }
      frame = requestAnimationFrame(loop)
    }

    function onVisibility() {
      cancelAnimationFrame(frame)
      if (!document.hidden && !reduceMotion) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
    }

    function onPointer(e: PointerEvent) {
      pointer.x = e.clientX
      pointer.y = e.clientY
      if (reduceMotion) draw()
    }

    function onResize() {
      resize()
      draw()
    }

    draw()
    if (!reduceMotion) frame = requestAnimationFrame(loop)
    window.addEventListener("resize", onResize)
    document.addEventListener("visibilitychange", onVisibility)
    if (cfg.spotlight && finePointer) window.addEventListener("pointermove", onPointer, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pointermove", onPointer)
    }
  }, [intensity])

  return <canvas ref={canvasRef} className="live-grid" aria-hidden="true" />
}
