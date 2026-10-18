import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
} from "motion/react";
import envelopeSealed from "@/assets/illustrations/envelope-sent.webp";
import envelopeOpened from "@/assets/illustrations/envelope-opened.webp";
import envelopeHero from "@/assets/illustrations/envelope.webp";
import { haptic } from "@/proto/haptics";

/**
 * Opening the hint (Figma M1, 834:45677), the signature moment on C1.
 * Slow enough to feel like opening something, never so slow that it blocks:
 *
 *   0 ms          Arrives        the sealed envelope floats up, large, mid-screen;
 *                                the page behind is dimmed and it breathes
 *   1100 ms       Seal pops      bloom, sparks, one soft haptic; the flap opens
 *   1800 ms       Settles        it glides up into the hero slot, the title fades in
 *   2700 ms       Her note       rises and comes into focus
 *   3200 ms       Picks          fan in one by one
 *   ≈ 4.3 s       Open           nothing waits
 *
 * A tap anywhere skips to the end. Reduced motion: a 200 ms cross-fade, same
 * content, nothing moves. Plays once per link and device.
 */

export type Phase =
  "wait" | "sealed" | "pop" | "glide" | "note" | "picks" | "done";
const ORDER: Phase[] = [
  "wait",
  "sealed",
  "pop",
  "glide",
  "note",
  "picks",
  "done",
];
export const reached = (phase: Phase, p: Phase) =>
  ORDER.indexOf(phase) >= ORDER.indexOf(p);

/** When each phase starts, in ms after the envelope begins to arrive. */
const AT: Record<Exclude<Phase, "wait" | "sealed">, number> = {
  pop: 1100,
  glide: 1800,
  note: 2700,
  picks: 3200,
  done: 4300,
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** A long, even glide (in and out), for the envelope settling into place. */
const EASE_GLIDE = [0.65, 0, 0.35, 1] as const;

/* ───────────────────────── Preload ───────────────────────── */

let decoded: Promise<void> | null = null;
/** Decode the three envelope states once (also called from WhatsApp, C0). */
export function preloadOpening(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!decoded) {
    decoded = Promise.all(
      [envelopeSealed, envelopeOpened, envelopeHero].map((src) => {
        const img = new Image();
        img.src = src;
        return img.decode().catch(() => undefined);
      }),
    ).then(() => undefined);
  }
  // Never hold the page hostage to an image: start anyway after 700 ms.
  return Promise.race([decoded, new Promise<void>((r) => setTimeout(r, 700))]);
}

/* ───────────────────────── Phase controller ───────────────────────── */

/**
 * Drives the phases. Changing `runKey` restarts from Sealed. `speed`
 * stretches every duration.
 */
export function useOpening({
  runKey,
  play,
  speed = 1,
  preroll = 300,
  haptics = true,
}: {
  runKey: string;
  play: boolean;
  speed?: number;
  /** Rest before the envelope arrives (lets the page transition finish). */
  preroll?: number;
  haptics?: boolean;
}) {
  const reduce = !!useReducedMotion();
  const animate = play && !reduce;
  const [st, setSt] = useState<{ key: string; phase: Phase }>(() => ({
    key: runKey,
    phase: animate ? "wait" : "done",
  }));
  let phase = st.phase;
  if (st.key !== runKey) {
    // New run: reset synchronously so remounted content starts hidden.
    phase = animate ? "wait" : "done";
    setSt({ key: runKey, phase });
  }
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!animate) {
      setSt((s) => (s.phase === "done" ? s : { ...s, phase: "done" }));
      return;
    }
    let alive = true;
    const list = timers.current;
    const set = (p: Phase) =>
      alive &&
      setSt((s) =>
        s.key === runKey && !reached(s.phase, p) ? { ...s, phase: p } : s,
      );
    const begin = () => {
      if (!alive) return;
      set("sealed");
      list.push(
        setTimeout(() => {
          set("pop");
          // Browsers only allow vibration after a tap (e.g. on WhatsApp’s link).
          const activated =
            typeof navigator === "undefined" ||
            (navigator.userActivation?.hasBeenActive ?? true);
          if (hapticsRef.current && activated && alive) haptic();
        }, AT.pop * speed),
        setTimeout(() => set("glide"), AT.glide * speed),
        setTimeout(() => set("note"), AT.note * speed),
        setTimeout(() => set("picks"), AT.picks * speed),
        setTimeout(() => set("done"), AT.done * speed),
      );
    };
    const t0 = performance.now();
    preloadOpening().then(() => {
      if (!alive) return;
      list.push(
        setTimeout(begin, Math.max(0, preroll - (performance.now() - t0))),
      );
    });
    return () => {
      alive = false;
      list.forEach(clearTimeout);
      list.length = 0;
    };
  }, [runKey, animate, speed, preroll]);

  /** Jump to the end (a tap during the opening). */
  const skip = () => {
    timers.current.forEach(clearTimeout);
    timers.current.length = 0;
    setSt((s) => (s.phase === "done" ? s : { ...s, phase: "done" }));
  };

  return { phase, animating: animate && phase !== "done", reduce, skip };
}

/* ───────────────────────── Envelope hero ───────────────────────── */

/** Envelope size while sealed, relative to the 80px hero slot (~206px wide). */
const SEALED_SCALE = 2.4;
/** Figma −8° (counter-clockwise positive) = CSS +8°: the art reads almost level. */
const SEALED_TILT = 8;
/** Sparks thrown when the seal pops (angle°, distance px at slot scale). */
const SPARKS: [number, number][] = [
  [-90, 46],
  [-35, 50],
  [20, 44],
  [150, 46],
  [-145, 50],
  [80, 38],
  [-60, 30],
  [115, 32],
];

/**
 * Hero art slot (112×84) with the envelope that opens. When `play`, the
 * envelope floats in large and tilted in the middle of the screen, breathes,
 * pops, then glides up into the slot where C1 shows it.
 */
export function EnvelopeHero({
  phase,
  play,
  k = 1,
}: {
  phase: Phase;
  play: boolean;
  k?: number;
}) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [dy, setDy] = useState<number | null>(play ? null : 0);

  useLayoutEffect(() => {
    if (!play) return;
    const slot = slotRef.current;
    const screen = slot?.closest<HTMLElement>("[data-screen]");
    if (!slot || !screen) return setDy(0);
    // Undo any transform on the way (page transition, desktop phone scale).
    const sr = screen.getBoundingClientRect();
    const r = slot.getBoundingClientRect();
    const s = sr.width / screen.offsetWidth || 1;
    const slotCenter = (r.top - sr.top + r.height / 2) / s;
    setDy(Math.round(screen.offsetHeight * 0.44 - slotCenter));
  }, [play]);

  const y = dy ?? 0;
  const at = (p: Phase) => reached(phase, p);

  const hidden = {
    y: y + 36,
    scale: SEALED_SCALE * 0.84,
    rotate: SEALED_TILT + 4,
    opacity: 0,
    filter: "blur(6px)",
  };
  const wrap: TargetAndTransition = !at("sealed")
    ? { ...hidden, transition: { duration: 0 } }
    : !at("pop")
      ? // Arrives: floats up into the middle of the screen and comes into focus.
        {
          y,
          scale: SEALED_SCALE,
          rotate: SEALED_TILT,
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 0.9 * k, ease: EASE_OUT },
        }
      : !at("glide")
        ? // Pops: a soft swell as the flap opens, the tilt eases out.
          {
            y,
            scale: [SEALED_SCALE, SEALED_SCALE * 1.1, SEALED_SCALE * 1.03],
            rotate: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
              scale: {
                duration: 0.6 * k,
                times: [0, 0.35, 1],
                ease: ["easeOut", "easeInOut"],
              },
              rotate: { type: "spring", visualDuration: 0.6 * k, bounce: 0.3 },
            },
          }
        : // Settles: one long, even glide up into the hero slot.
          {
            y: 0,
            scale: 1,
            rotate: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.95 * k, ease: EASE_GLIDE },
          };

  const fade = (on: boolean, d: number, delay = 0): TargetAndTransition => ({
    opacity: on ? 1 : 0,
    transition: { duration: d * k, delay: delay * k, ease: "easeInOut" },
  });

  const ready = dy !== null;
  const initialWrap = play ? hidden : false;

  return (
    <div
      ref={slotRef}
      data-anno="hero-art"
      className="relative z-10 mx-auto h-[84px] w-[112px]"
    >
      {ready && (
        <motion.div
          data-anno="seal"
          className="absolute inset-0"
          initial={initialWrap}
          animate={wrap}
          style={{ transformOrigin: "50% 50%" }}
        >
          {/* A slow breath while sealed: it floats and its glow swells, waiting to be opened. */}
          <motion.div
            className="absolute inset-0"
            animate={
              play && !at("pop")
                ? { y: [0, -3, 0], rotate: [0, -1.2, 0] }
                : { y: 0, rotate: 0 }
            }
            transition={
              play && !at("pop")
                ? { duration: 2.2 * k, ease: "easeInOut", repeat: Infinity }
                : { duration: 0.4 * k, ease: EASE_OUT }
            }
          >
            {play && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 size-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(155,128,255,0.5), rgba(155,128,255,0) 100%)",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={
                  at("pop")
                    ? {
                        opacity: [0.35, 0.95, 0],
                        scale: [0.8, 1.6, 2],
                        transition: {
                          duration: 1.1 * k,
                          times: [0, 0.3, 1],
                          ease: "easeOut",
                        },
                      }
                    : {
                        opacity: [0.15, 0.4, 0.15],
                        scale: [0.7, 0.85, 0.7],
                        transition: {
                          duration: 2.2 * k,
                          ease: "easeInOut",
                          repeat: Infinity,
                        },
                      }
                }
              />
            )}
            {play &&
              SPARKS.map(([deg, dist], i) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <motion.svg
                    key={i}
                    aria-hidden
                    viewBox="0 0 10 10"
                    className="pointer-events-none absolute left-1/2 top-1/2 -ml-[4px] -mt-[4px] size-2"
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                    animate={
                      at("pop")
                        ? {
                            opacity: [0, 1, 1, 0],
                            x: Math.cos(rad) * dist,
                            y: Math.sin(rad) * dist - 8,
                            scale: [0.2, 1.1, 0.9, 0.4],
                            rotate: 120,
                          }
                        : { opacity: 0, x: 0, y: 0, scale: 0.2 }
                    }
                    transition={{
                      duration: 1 * k,
                      delay: 0.03 * i * k,
                      ease: EASE_OUT,
                      times: [0, 0.3, 0.7, 1],
                    }}
                  >
                    <path
                      d="M5 0 C5.4 3.6 6.4 4.6 10 5 C6.4 5.4 5.4 6.4 5 10 C4.6 6.4 3.6 5.4 0 5 C3.6 4.6 4.6 3.6 5 0Z"
                      fill={i % 2 ? "#ffffff" : "#a88bff"}
                    />
                  </motion.svg>
                );
              })}
            <div data-anno="haptic" className="absolute inset-0">
              {play && (
                <>
                  <motion.img
                    src={envelopeSealed}
                    alt=""
                    draggable={false}
                    className="absolute left-[13px] top-[10.3px] w-[86px] max-w-none select-none"
                    initial={{ opacity: 1 }}
                    animate={fade(!at("pop"), 0.22, 0.04)}
                  />
                  <motion.img
                    src={envelopeOpened}
                    alt=""
                    draggable={false}
                    className="absolute left-[17px] top-[-16.5px] w-[78px] max-w-none select-none"
                    initial={{ opacity: 0 }}
                    animate={
                      at("glide")
                        ? fade(false, 0.5, 0.4)
                        : fade(at("pop"), 0.22)
                    }
                  />
                </>
              )}
              {/* Final hero: envelope.webp, CROP 0.68 at (0.149, 0.127) in 80×80. */}
              <motion.div
                className="absolute left-4 top-[2px] size-20 overflow-hidden"
                initial={play ? { opacity: 0 } : false}
                animate={fade(at("glide"), 0.5, 0.4)}
              >
                <img
                  src={envelopeHero}
                  alt="An opened glass envelope with a violet seal"
                  draggable={false}
                  className="absolute left-[-17.53px] top-[-14.94px] w-[117.65px] max-w-none select-none"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

/* ───────────────────────── Reveal ───────────────────────── */

type RevealKind = "rise" | "fan" | "title";

/**
 * Content that enters with the opening: `title` (fades up and into focus as
 * the envelope settles), `rise` (her note, 32px, ease-out, into focus), `fan`
 * (picks, 130ms apart, soft spring).
 */
export function Reveal({
  phase,
  at,
  kind,
  i = 0,
  k = 1,
  play,
  className,
  children,
  "data-anno": anno,
}: {
  phase: Phase;
  at: Phase;
  kind: RevealKind;
  i?: number;
  k?: number;
  play: boolean;
  className?: string;
  children: ReactNode;
  "data-anno"?: string;
}) {
  const hidden: TargetAndTransition =
    kind === "rise"
      ? { opacity: 0, y: 32, filter: "blur(6px)" }
      : kind === "fan"
        ? { opacity: 0, y: 48, scale: 0.96, rotate: i % 2 ? 1.6 : -1.6 }
        : { opacity: 0, y: 14, filter: "blur(8px)" };
  const shown = reached(phase, at);
  const transition: Transition =
    kind === "fan"
      ? {
          type: "spring",
          visualDuration: 0.6 * k,
          bounce: 0.16,
          delay: i * 0.13 * k,
          opacity: { duration: 0.45 * k, delay: i * 0.13 * k, ease: "easeOut" },
        }
      : kind === "rise"
        ? { duration: 0.75 * k, ease: EASE_OUT }
        : // Lands as the envelope finishes its glide.
          { duration: 0.8 * k, delay: 0.6 * k, ease: EASE_OUT };
  return (
    <motion.div
      data-anno={anno}
      className={className}
      initial={play ? hidden : false}
      animate={
        shown
          ? { opacity: 1, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" }
          : hidden
      }
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
