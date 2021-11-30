import { MessageId } from '../../src/Message'

export interface Seat {
  readonly row: number
  readonly column: number
}

export type SeatWithState = Seat &
  (
    | { readonly state: 'Unavailable' | 'Free' }
    | {
        readonly state: 'Reserved' | 'Booked'
        readonly correlationId: MessageId
      }
  )

export function $Seat(row: number, column: number): Seat
export function $Seat(
  row: number,
  column: number,
  state: 'Free' | 'Unavailable',
): SeatWithState
export function $Seat(
  row: number,
  column: number,
  state: 'Reserved' | 'Booked',
  correlationId: MessageId,
): SeatWithState
export function $Seat(
  row: number,
  column: number,
  state?: SeatWithState['state'],
  correlationId?: MessageId,
): Seat | SeatWithState {
  return undefined === state
    ? { row, column }
    : undefined === correlationId
    ? { row, column, state }
    : { row, column, state, correlationId }
}
