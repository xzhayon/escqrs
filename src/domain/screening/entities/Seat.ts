import { CorrelationId } from '../../../core/messages/Message'

export type Seat = { readonly row: number; readonly column: number } & (
  | { readonly state: 'Unavailable' | 'Free' }
  | {
      readonly state: 'Reserved' | 'Booked'
      readonly correlationId: CorrelationId
    }
)

export function $Seat(
  row: number,
  column: number,
  state: 'Free' | 'Unavailable',
): Seat
export function $Seat(
  row: number,
  column: number,
  state: 'Reserved' | 'Booked',
  correlationId: CorrelationId,
): Seat
export function $Seat(
  row: number,
  column: number,
  state: Seat['state'],
  correlationId?: CorrelationId,
): Seat {
  return { row, column, state, correlationId: correlationId as any }
}
