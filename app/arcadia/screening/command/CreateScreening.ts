import { gen } from '@effect-ts/system/Effect'
import { Id } from '../../../../src/entity/Entity'
import {
  $Command,
  Command,
} from '../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../src/entity/message/command/CommandHandler'
import { $Film, Film } from '../../film/Film'
import { $Screen, Screen } from '../../screen/Screen'
import { $Screening, Screening } from '../Screening'

export interface CreateScreening extends Command<Screening, 'CreateScreening'> {
  readonly filmId: Id<Film>
  readonly date: Date
  readonly screenId: Id<Screen>
}

export function $CreateScreening() {
  return $Command<CreateScreening>('CreateScreening')
}

$CreateScreening.handler = $CommandHandler<CreateScreening>('CreateScreening')(
  (command) =>
    gen(function* (_) {
      const film = yield* _($Film.load(command.filmId))
      const screen = yield* _($Screen.load(command.screenId))
      const screening_ = yield* _(
        $Screening.create(
          command.aggregateId,
          film,
          command.date,
          screen,
          command,
        ),
      )
      yield* _($Screening.save(screening_))
    }),
)
