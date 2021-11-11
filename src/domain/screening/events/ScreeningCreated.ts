import { Array, Effect, pipe } from '@effect-ts/core'
import { $Aggregate } from '../../../core/aggregates/Aggregate'
import { $Entity } from '../../../core/entities/Entity'
import { HasRepository } from '../../../core/entities/Repository'
import { HasLogger } from '../../../core/Logger'
import { $Event, Event } from '../../../core/messages/events/Event'
import { $EventHandler } from '../../../core/messages/events/EventHandler'
import { HasEventStore } from '../../../core/messages/events/EventStore'
import { HasUuid } from '../../../core/Uuid'
import { Film } from '../entities/Film'
import { Screen } from '../entities/Screen'
import { $Screening } from '../entities/Screening'
import { Screening } from '../projections/Screening'

export interface ScreeningCreated_v0 extends Event<'ScreeningCreated'> {
  readonly filmId: Film['_']['id']
  readonly filmName: Film['name']
  readonly screenId: Screen['_']['id']
  readonly screenName: Screen['name']
  readonly date: Date
  readonly seats: Screen['seats']
}

export function $ScreeningCreated() {
  return $Event<ScreeningCreated_v0>('Event.ScreeningCreated')
}

$ScreeningCreated.updateScreeningProjection =
  $EventHandler<ScreeningCreated_v0>(
    'Event.ScreeningCreated',
    'UpdateScreeningProjection',
  )(
    pipe(
      Effect.accessServices({
        $eventStore: HasEventStore,
        $logger: HasLogger,
        $repository: HasRepository,
        $uuid: HasUuid,
      })(
        ({ $eventStore, $logger, $repository, $uuid }) =>
          (event) =>
            pipe(
              Effect.do,
              Effect.bind('screening', () =>
                $Aggregate.load($Screening.aggregate)(event.aggregateId),
              ),
              Effect.let('seats', ({ screening }) =>
                pipe(
                  screening.seats,
                  Array.flatten,
                  Array.filter(({ state }) => 'Unavailable' !== state),
                ),
              ),
              Effect.chain(({ screening, seats }) =>
                $Entity<Screening>('Projection.Screening')(
                  {
                    film: { name: screening.film.name },
                    screen: { name: screening.screen.name },
                    date: screening.date,
                    seats: { total: seats.length, free: seats.length },
                  },
                  { id: screening._.id, dateCreated: event._.date },
                ),
              ),
              Effect.tap($Entity.create),
              Effect.provideService(HasEventStore)($eventStore),
              Effect.provideService(HasLogger)($logger),
              Effect.provideService(HasRepository)($repository),
              Effect.provideService(HasUuid)($uuid),
            ),
      ),
    ),
  )
