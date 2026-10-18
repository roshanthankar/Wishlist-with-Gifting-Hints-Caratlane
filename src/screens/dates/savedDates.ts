import { useProtoState } from '@/proto/store'

export type DateKey = 'anniversary' | 'birthday' | 'mom'
export type SavedDates = Record<DateKey, boolean>

/** Which saved dates nudge Priya (B0). B1 hides its nudge when the anniversary is off. */
export function useSavedDates() {
  return useProtoState<SavedDates>('dates.nudges', { anniversary: true, birthday: true, mom: true })
}
