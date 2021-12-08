import { Id } from '../../src/entity/Entity'
import { Message } from '../../src/entity/message/Message'

export interface Seat {
  readonly row: number
  readonly column: number
}

export type SeatWithState = Seat &
  (
    | { readonly state: 'Unavailable' | 'Free' }
    | {
        readonly state: 'Reserved' | 'Booked'
        readonly correlationId: Id<Message>
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
  correlationId: Id<Message>,
): SeatWithState
export function $Seat(
  row: number,
  column: number,
  state?: SeatWithState['state'],
  correlationId?: Id<Message>,
): Seat | SeatWithState {
  return undefined === state
    ? { row, column }
    : undefined === correlationId
    ? { row, column, state }
    : { row, column, state, correlationId }
}
