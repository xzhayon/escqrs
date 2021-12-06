import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Command, Command } from '../../src/Command'
import { $CommandHandler } from '../../src/CommandHandler'
import { Id } from '../../src/Entity'
import { HasEventStore } from '../../src/EventStore'
import { HasLogger } from '../../src/Logger'
import { $Repository, HasRepository } from '../../src/Repository'
import { HasUuid } from '../../src/Uuid'
import { Film } from './Film'
import { Screen } from './Screen'
import { $Screening, Screening } from './Screening'

export interface CreateScreening extends Command<Screening, 'CreateScreening'> {
  readonly filmId: Id<Film>
  readonly screenId: Id<Screen>
  readonly date: Date
}

export function $CreateScreening() {
  return $Command<CreateScreening>('CreateScreening')
}

$CreateScreening.handler = $CommandHandler<CreateScreening>('CreateScreening')(
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
              $Repository.find<Film>({
                _: { type: 'Film', id: command.filmId },
              }),
            )
            const screen = yield* _(
              $Repository.find<Screen>({
                _: { type: 'Screen', id: command.screenId },
              }),
            )
            const screening_ = yield* _(
              $Screening.create(
                command.aggregateId,
                film,
                screen,
                command.date,
                command,
              ),
            )
            yield* _($Screening.save(screening_))
          }),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
