import { Effect, NonEmptyArray, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { Id } from '../../../../src/entity/Entity'
import {
  $Command,
  Command,
} from '../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../src/entity/message/command/CommandHandler'
import { HasEventStore } from '../../../../src/entity/message/event/eventstore/EventStore'
import {
  $Repository,
  HasRepository,
} from '../../../../src/entity/repository/Repository'
import { HasLogger } from '../../../../src/logger/Logger'
import { HasUuid } from '../../../../src/uuid/Uuid'
import { Film } from '../../film/Film'
import { Screen } from '../../screen/Screen'
import { $Screening, Screening } from '../Screening'

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
            const films = yield* _(
              $Repository.find<Film>({
                _: { type: 'Film', id: command.filmId },
              }),
            )
            const screens = yield* _(
              $Repository.find<Screen>({
                _: { type: 'Screen', id: command.screenId },
              }),
            )
            const screening_ = yield* _(
              $Screening.create(
                command.aggregateId,
                NonEmptyArray.head(films),
                NonEmptyArray.head(screens),
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
