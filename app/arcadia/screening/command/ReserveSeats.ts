import { Array } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import {
  $Command,
  Command,
} from '../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../src/entity/message/command/CommandHandler'
import { Seat } from '../../Seat'
import { $Screening, Screening } from '../Screening'

export interface ReserveSeats extends Command<Screening, 'ReserveSeats'> {
  readonly seats: Array.Array<Seat>
}

export function $ReserveSeats() {
  return $Command<ReserveSeats>('ReserveSeats')
}

$ReserveSeats.handler = $CommandHandler<ReserveSeats>('ReserveSeats')(
  (command) =>
    gen(function* (_) {
      const screening = yield* _($Screening.load(command.aggregateId))
      const screening_ = yield* _(
        $Screening.reserveSeats(screening, command.seats, command),
      )
      yield* _($Screening.save(screening_))
    }),
)
