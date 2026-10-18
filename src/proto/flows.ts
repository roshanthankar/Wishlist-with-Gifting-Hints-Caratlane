import { FRAMES, type FrameId, type Persona } from './frames'

export interface Flow {
  id: string
  /** “Row 01” … */
  kicker: string
  title: string
  /** The row’s subtitle in Figma, verbatim. */
  summary: string
  /** Frames left to right, as laid out in the row. */
  frames: FrameId[]
}

/**
 * The rows of Section 2 (703:712) from Row 01 (830:27361) down, each with
 * its frames in Figma order. Every screen appears once.
 */
export const FLOWS: Flow[] = [
  {
    id: 'row-1',
    kicker: 'Row 01',
    title: 'Save for someone, with confidence',
    summary: 'Rahul · CaratLane app · the advice changes with the relationship · brief ask 1',
    frames: ['A1', 'A2', 'A3', 'A4', 'A4b', 'A4c', 'A5', 'A6', 'A7'],
  },
  {
    id: 'row-2',
    kicker: 'Row 02',
    title: 'Also possible: a second opinion',
    summary: 'Ananya votes in secret, or they play Style match weeks before · brief ask 1',
    frames: ['A8', 'A9', 'A10', 'A11', 'A11b', 'A12'],
  },
  {
    id: 'row-3',
    kicker: 'Row 03',
    title: 'Drop a hint',
    summary: 'Priya · CaratLane app · WhatsApp, a link or a QR card · brief ask 2',
    frames: ['B0', 'B1', 'B2', 'B3', 'B3b', 'B4', 'B4b', 'B5', 'B6'],
  },
  {
    id: 'row-4',
    kicker: 'Row 04',
    title: 'The hint lands',
    summary: 'Rahul, and Mom · mobile web, no app or login · how hints work, the opening, edge states · brief ask 3',
    frames: ['C0', 'C1', 'C2', 'E1', 'E2', 'E3'],
  },
]

export const flowById = (id: string) => FLOWS.find((f) => f.id === id)

/** Who acts in a row, in order of appearance. */
export const peopleIn = (f: Flow): Persona[] => [...new Set(f.frames.map((id) => FRAMES[id].persona))]

/** The row a screen belongs to (each screen is in exactly one). */
export const defaultFlowFor = (frame: FrameId): Flow => FLOWS.find((f) => f.frames.includes(frame)) ?? FLOWS[0]
