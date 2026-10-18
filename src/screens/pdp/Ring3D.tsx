import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Classic 9KT Gold Vanki Ring (CaratLane UR02452-8Y0000) as a real-time 3D model,
 * reconstructed from CaratLane’s product views:
 *   - Looking through the ring, it is a plain circle (ring size 12).
 *   - The band rises along the finger to a sharp chevron on the top AND the
 *     bottom of the finger, dipping back level at the two sides. Seen from
 *     above, both chevrons overlap into the single straight-armed “Λ” of the
 *     listing photo; at three-quarter they read as an “M”.
 *
 * Geometry (millimetres, built in code, no model file):
 *   centre line P(θ) = (R cos θ, R sin θ, z(θ)), z = H·(1 − |cos θ|) — linear in
 *   x, so the arms are straight — with mitred, crisp tips.
 *   Band: 1.25 mm thick × 1.4 mm wide, a softly squared profile (a slim 9KT band) whose
 *   broad face always faces outward, like a real band on the finger.
 * Material: physically based polished gold, lit by studio softboxes rendered
 * into an environment map.
 */

const R_IN = 8.05 // size 12: inner diameter 16.1 mm
const THICK = 1.25
const WIDTH = 1.4
const R = R_IN + THICK / 2
const H = 16 // chevron rise along the finger (the listing photo’s Λ is 0.94× as tall as wide)
/**
 * Build the band as a mitred chevron: for each angle θ around the finger the
 * cross-section is cut along the finger axis, centred on z = H·(1 − |cos θ|).
 * Its axial half-width grows with the slope so the band stays WIDTH wide
 * measured square to the band, which gives a geometrically sharp outer tip and
 * a clean inner corner, like two bars mitred together.
 */
function buildRingGeometry() {
  const S = 1440 // divisible by 4, so both tips (θ = 90°, 270°) are exact vertices
  const P = 40
  const n = 3 // superellipse profile: 2 = ellipse, higher = squarer
  const k = H / R
  const prof: [number, number][] = []
  for (let j = 0; j < P; j++) {
    const a = (j / P) * Math.PI * 2
    const c = Math.cos(a)
    const sn = Math.sin(a)
    prof.push([Math.sign(c) * Math.abs(c) ** (2 / n), Math.sign(sn) * Math.abs(sn) ** (2 / n)])
  }
  const positions = new Float32Array(S * P * 3)
  for (let i = 0; i < S; i++) {
    const t = (i / S) * Math.PI * 2
    const ct = Math.cos(t)
    const st = Math.sin(t)
    const zc = H * (1 - Math.abs(ct))
    const half = (WIDTH / 2) * Math.sqrt(1 + k * k * st * st) // axial half-width
    for (let j = 0; j < P; j++) {
      const [u, v] = prof[j]
      const r = R + (THICK / 2) * u // thickness always points away from the finger
      const q = (i * P + j) * 3
      positions[q] = r * ct
      positions[q + 1] = r * st
      positions[q + 2] = zc + half * v
    }
  }
  const index: number[] = []
  for (let i = 0; i < S; i++) {
    const i2 = (i + 1) % S
    for (let j = 0; j < P; j++) {
      const j2 = (j + 1) % P
      const v0 = i * P + j
      const v1 = i2 * P + j
      const v2 = i2 * P + j2
      const v3 = i * P + j2
      index.push(v0, v1, v3, v1, v2, v3)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  g.setIndex(index)
  g.computeVertexNormals()
  // Finger axis (z) → screen up (y), so the chevrons point up like the photo.
  g.rotateX(-Math.PI / 2)
  return g
}

/** 9KT yellow gold, matched to CaratLane’s listing renders (sRGB ≈ 248, 205, 127). */
const GOLD = new THREE.Color('#f8cd80')

function VankiRing() {
  const geometry = useMemo(buildRingGeometry, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh geometry={geometry} castShadow>
      <meshPhysicalMaterial color={GOLD} metalness={1} roughness={0.15} envMapIntensity={1.35} clearcoat={0.2} clearcoatRoughness={0.1} />
    </mesh>
  )
}

/** Bright jewellery studio: white sweep, long softboxes for the arm reflections, a top light, warm and cool kickers. */
function Studio() {
  return (
    <Environment resolution={512} frames={1}>
      <color attach="background" args={['#bfb7ad']} />
      <Lightformer form="rect" intensity={5} position={[0, 7, 1]} rotation-x={Math.PI / 2} scale={[14, 4, 1]} />
      <Lightformer form="rect" intensity={3.2} position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[12, 2, 1]} />
      <Lightformer form="rect" intensity={3.2} position={[7, 1, 2]} rotation-y={-Math.PI / 2} scale={[12, 2, 1]} />
      <Lightformer form="rect" intensity={2.2} position={[0, 0, 9]} scale={[6, 3, 1]} />
      <Lightformer form="ring" color="#fff6e4" intensity={2.5} position={[0, 2, 6]} scale={3} />
      <Lightformer form="rect" color="#fff0d6" intensity={1.6} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[14, 6, 1]} />
      <Lightformer form="rect" color="#7a7066" intensity={1} position={[0, 1, -9]} scale={[8, 12, 1]} />
      <Lightformer form="rect" intensity={1.8} position={[-5, -3, -6]} rotation-y={Math.PI / 4} scale={[3, 8, 1]} />
    </Environment>
  )
}

/** Turntable speed (radians per frame at 60fps): one turn about every 14 s. */
const SPIN = 0.0075
/** After a drag, the turntable eases back in this long after letting go (ms). */
const RESUME_AFTER = 1200

/** A scripted push, as if a finger flicked the ring (the first-view hint). */
export interface Nudge {
  id: number
  /** +1 to the right, −1 to the left. */
  dir: number
}

/**
 * Turn the ring itself, like holding it under fixed studio lights: drag in
 * any direction to rotate it to any angle (no limits, no gimbal lock), let go
 * and it keeps a little momentum, then eases back into its turntable spin.
 * It is always turning while no one holds it.
 */
function Turntable({
  active,
  reduce,
  nudge,
  speed = SPIN,
  onFirstInteract,
  children,
}: {
  active: boolean
  reduce: boolean
  nudge?: Nudge
  /** Turntable speed (radians per frame at 60fps). */
  speed?: number
  onFirstInteract?: () => void
  children: ReactNode
}) {
  const group = useRef<THREE.Group>(null)
  const { gl } = useThree()
  const vel = useRef({ x: 0, y: 0 }) // radians per frame (60fps), screen axes
  const drag = useRef<{ id: number; x: number; y: number; t: number } | null>(null)
  // As if let go long ago, so the turntable is already turning on arrival.
  const idleSince = useRef(performance.now() - RESUME_AFTER)
  const auto = useRef(0)
  const qx = useMemo(() => new THREE.Quaternion(), [])
  const qy = useMemo(() => new THREE.Quaternion(), [])
  const AX = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const AY = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  const spin = (dx: number, dy: number) => {
    const g = group.current
    if (!g) return
    qy.setFromAxisAngle(AY, dx)
    qx.setFromAxisAngle(AX, dy)
    g.quaternion.premultiply(qy).premultiply(qx)
  }

  useEffect(() => {
    const el = gl.domElement
    el.style.touchAction = 'none'
    el.style.cursor = 'grab'
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId)
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() }
      vel.current = { x: 0, y: 0 }
      auto.current = 0
      el.style.cursor = 'grabbing'
      onFirstInteract?.()
    }
    const move = (e: PointerEvent) => {
      const d = drag.current
      if (!d || d.id !== e.pointerId) return
      const rect = el.getBoundingClientRect()
      const k = (Math.PI * 1.1) / Math.max(rect.width, 1) // a full drag across ≈ 200°
      const dx = (e.clientX - d.x) * k
      const dy = (e.clientY - d.y) * k
      const now = performance.now()
      const dt = Math.max(now - d.t, 1)
      spin(dx, dy)
      vel.current = { x: (dx / dt) * 16.7, y: (dy / dt) * 16.7 }
      drag.current = { id: d.id, x: e.clientX, y: e.clientY, t: now }
    }
    const up = (e: PointerEvent) => {
      if (drag.current?.id !== e.pointerId) return
      drag.current = null
      idleSince.current = performance.now()
      el.style.cursor = 'grab'
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl])

  // The hint’s flick: a push that decays like a real one.
  useEffect(() => {
    if (!nudge || drag.current) return
    vel.current = { x: nudge.dir * 0.07, y: 0 }
  }, [nudge])

  useFrame((_, delta) => {
    if (drag.current) return
    const f = Math.min(delta * 60, 3)
    const v = vel.current
    // Momentum from a flick…
    if (Math.abs(v.x) + Math.abs(v.y) > 0.0004) {
      spin(v.x * f, v.y * f)
      const decay = Math.pow(0.94, f)
      v.x *= decay
      v.y *= decay
    }
    // …on top of the turntable, which eases in and out instead of jumping.
    const target = active && !reduce && performance.now() - idleSince.current > RESUME_AFTER ? speed : 0
    auto.current += (target - auto.current) * Math.min(1, 0.035 * f)
    if (auto.current > 1e-5) spin(auto.current * f, 0)
  })

  return (
    <group ref={group} rotation={POSE}>
      {children}
    </group>
  )
}

const POSE: [number, number, number] = (() => {
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('pose') : null
  return q ? (q.split(',').map(Number) as [number, number, number]) : [0.1, 0.72, 0]
})()

export default function Ring3D({
  active = true,
  nudge,
  speed,
  shadow = true,
  label = '3D view of the Classic 9KT Gold Vanki Ring. Drag to rotate.',
  onReady,
  onFirstInteract,
}: {
  active?: boolean
  nudge?: Nudge
  /** Turntable speed (radians per frame at 60fps); defaults to one turn about every 14 s. */
  speed?: number
  /** Soft contact shadow under the ring (off on dark backgrounds). */
  shadow?: boolean
  label?: string
  /** The first frame is on screen (the hint waits for it). */
  onReady?: () => void
  onFirstInteract?: () => void
}) {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'demand'}
      resize={{ offsetSize: true }}
      camera={{ position: [0, 1.5, 100], fov: 16, near: 1, far: 500 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1.0 }}
      aria-label={label}
      role="img"
      onCreated={() => onReady?.()}
    >
      <Studio />
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 20, 16]} intensity={1.4} color="#fff6e8" />
      <Turntable active={active} reduce={reduce} nudge={nudge} speed={speed} onFirstInteract={onFirstInteract}>
        <Center>
          <VankiRing />
        </Center>
      </Turntable>
      {shadow && <ContactShadows position={[0, -13.5, 0]} opacity={0.3} scale={40} blur={2.6} far={20} resolution={512} color="#5a4520" />}
    </Canvas>
  )
}
