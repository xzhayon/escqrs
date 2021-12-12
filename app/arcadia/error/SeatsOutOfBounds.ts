import { Id } from '../../../src/entity/Entity'
import { Screening } from '../screening/Screening'
import { Seat } from '../Seat'

export class SeatsOutOfBounds extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, SeatsOutOfBounds.prototype)
  }

  static build(
    screeningId: Id<Screening>,
    seats: { readonly rows: number; readonly columns: number },
    seat: Seat,
  ) {
    return new SeatsOutOfBounds(
      `Cannot reserve seat "${seat.row}-${seat.column}" on screening "${screeningId}", only ${seats.rows} rows and ${seats.columns} columns available`,
    )
  }
}
