import { Effect, pipe } from '@effect-ts/core'
import { $Entity } from '../../../core/entities/Entity'
import { HasRepository } from '../../../core/entities/Repository'
import { HasLogger } from '../../../core/Logger'
import { $Command, Command } from '../../../core/messages/commands/Command'
import { $CommandHandler } from '../../../core/messages/commands/CommandHandler'
import {
  $EventStore,
  HasEventStore,
} from '../../../core/messages/events/EventStore'
import { HasUuid } from '../../../core/Uuid'
import { Film } from '../entities/Film'
import { Screen } from '../entities/Screen'
import { $ScreeningCreated } from '../events/ScreeningCreated'

export interface CreateScreening extends Command<'CreateScreening'> {
  readonly filmId: Film['_']['id']
  readonly screenId: Screen['_']['id']
  readonly date: Date
}

export function $CreateScreening() {
  return $Command<CreateScreening>('Command.CreateScreening')
}

$CreateScreening.handler = $CommandHandler<CreateScreening>(
  'Command.CreateScreening',
)(
  Effect.accessServices({
    $eventStore: HasEventStore,
    $logger: HasLogger,
    $repository: HasRepository,
    $uuid: HasUuid,
  })(
    ({ $eventStore, $logger, $repository, $uuid }) =>
      (command) =>
        pipe(
          Effect.do,
          Effect.bindAllPar(() => ({
            film: $Entity.read<Film>('Film')(command.filmId),
            screen: $Entity.read<Screen>('Screen')(command.screenId),
          })),
          Effect.chain(({ film, screen }) =>
            $ScreeningCreated()({
              aggregateId: command.aggregateId,
              filmId: film._.id,
              filmName: film.name,
              screenId: screen._.id,
              screenName: screen.name,
              date: command.date,
              seats: screen.seats,
            })(command),
          ),
          Effect.tap($EventStore.publish(0)),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
