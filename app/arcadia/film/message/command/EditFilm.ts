import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import {
  $Command,
  Command,
} from '../../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../../src/entity/message/command/CommandHandler'
import { HasEventStore } from '../../../../../src/entity/message/event/eventstore/EventStore'
import { HasRepository } from '../../../../../src/entity/repository/Repository'
import { HasLogger } from '../../../../../src/logger/Logger'
import { $Film, Film } from '../../Film'

export interface EditFilm extends Command<Film, 'EditFilm'> {
  readonly title?: string
}

export function $EditFilm() {
  return $Command<EditFilm>('EditFilm')
}

$EditFilm.handler = $CommandHandler<EditFilm>('EditFilm')(
  Effect.accessServices({
    $eventStore: HasEventStore,
    $logger: HasLogger,
    $repository: HasRepository,
  })(
    ({ $eventStore, $logger, $repository }) =>
      (command) =>
        pipe(
          gen(function* (_) {
            const film = yield* _($Film.load(command.aggregateId))
            const _film = $Film.edit(film, { title: command.title })

            yield* _($Film.save(_film))
          }),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
        ),
  ),
)
