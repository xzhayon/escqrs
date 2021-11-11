import { Array, Effect, pipe } from '@effect-ts/core'
import { $Aggregate } from '../../../core/aggregates/Aggregate'
import { $Entity } from '../../../core/entities/Entity'
import { HasRepository } from '../../../core/entities/Repository'
import { HasLogger } from '../../../core/Logger'
import {
  $ServiceBus,
  HasServiceBus,
} from '../../../core/messages/commands/ServiceBus'
import { $Event, Event } from '../../../core/messages/events/Event'
import { $EventHandler } from '../../../core/messages/events/EventHandler'
import { HasEventStore } from '../../../core/messages/events/EventStore'
import { HasUuid } from '../../../core/Uuid'
import { $ExpireReservation } from '../commands/ExpireReservation'
import { Seat } from '../commands/ReserveSeats'
import { $Screening } from '../entities/Screening'
import { Screening } from '../projections/Screening'

const TIMEOUT = 10000

export interface SeatsReserved_v0 extends Event<'SeatsReserved'> {
  readonly seats: Array.Array<Seat>
}

export function $SeatsReserved() {
  return $Event<SeatsReserved_v0>('Event.SeatsReserved')
}

$SeatsReserved.expireReservation = $EventHandler<SeatsReserved_v0>(
  'Event.SeatsReserved',
  'ExpireReservation',
)(
  pipe(
    Effect.accessServices({
      $logger: HasLogger,
      $repository: HasRepository,
      $serviceBus: HasServiceBus,
      $uuid: HasUuid,
    })(
      ({ $logger, $repository, $serviceBus, $uuid }) =>
        (event) =>
          pipe(
            event,
            $ExpireReservation()({
              aggregateId: event.aggregateId,
              timeout: TIMEOUT,
            }),
            Effect.tap($ServiceBus.dispatch),
            Effect.delay(TIMEOUT),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasRepository)($repository),
            Effect.provideService(HasServiceBus)($serviceBus),
            Effect.provideService(HasUuid)($uuid),
          ),
    ),
  ),
)

$SeatsReserved.updateScreeningProjection = $EventHandler<SeatsReserved_v0>(
  'Event.SeatsReserved',
  'UpdateScreeningProjection',
)(
  pipe(
    Effect.accessServices({
      $eventStore: HasEventStore,
      $logger: HasLogger,
      $repository: HasRepository,
    })(
      ({ $eventStore, $logger, $repository }) =>
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
            Effect.let('freeSeats', ({ seats }) =>
              pipe(
                seats,
                Array.filter(({ state }) => 'Free' === state),
              ),
            ),
            Effect.tap(({ screening, seats, freeSeats }) =>
              $Entity.update<Screening>({
                _: {
                  type: 'Projection.Screening',
                  id: screening._.id,
                  dateUpdated: event._.date,
                },
                seats: { total: seats.length, free: freeSeats.length },
              }),
            ),
            Effect.provideService(HasEventStore)($eventStore),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasRepository)($repository),
          ),
    ),
  ),
)
