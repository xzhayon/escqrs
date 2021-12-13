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
import { HasUuid } from '../../../../../src/uuid/Uuid'
import { $Film, Film } from '../../Film'

export interface CreateFilm extends Command<Film, 'CreateFilm'> {
  readonly title: string
}

export function $CreateFilm() {
  return $Command<CreateFilm>('CreateFilm')
}

$CreateFilm.handler = $CommandHandler<CreateFilm>('CreateFilm')(
  Effect.accessServices({
    $eventStore: HasEventStore,
    $logger: HasLogger,
    $repository: HasRepository,
    $uuid: HasUuid,
  })(
    ({ $eventStore, $logger, $repository, $uuid }) =>
      (command) =>
        pipe(
          gen(function* (_) {
            const film = yield* _(
              $Film.create(command.aggregateId, command.title),
            )
            yield* _($Film.save(film))
          }),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
