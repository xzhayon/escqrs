import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import { $Aggregate } from '../../../src/Aggregate'
import { Id } from '../../../src/entity/Entity'
import { $EventHandler } from '../../../src/entity/message/event/EventHandler'
import { HasEventStore } from '../../../src/entity/message/event/eventstore/EventStore'
import { $MutableEntity } from '../../../src/entity/MutableEntity'
import { HasRepository } from '../../../src/entity/repository/Repository'
import { HasLogger } from '../../../src/logger/Logger'
import { HasUuid } from '../../../src/uuid/Uuid'
import { ScreeningCreated } from '../screening/event/ScreeningCreated'
import { Screening } from '../screening/Screening'
import { Projection } from './Projection'

export interface ScreeningProjection
  extends Projection<'Screening', Id<Screening>> {
  readonly filmName: string
  readonly screenName: string
  readonly date: Date
  readonly seats: { readonly total: number; readonly free: number }
}

const aggregate = $Aggregate<ScreeningProjection>('_Projection.Screening')

export function $ScreeningProjection() {
  return $MutableEntity<ScreeningProjection>('_Projection.Screening')
}

$ScreeningProjection.id = aggregate.id
$ScreeningProjection.load = aggregate.load
$ScreeningProjection.save = aggregate.save
$ScreeningProjection.delete = aggregate.delete

$ScreeningProjection.onScreeningCreated = $EventHandler<ScreeningCreated>(
  'ScreeningCreated',
  'UpdateProjection',
)(
  Effect.accessServices({
    $eventStore: HasEventStore,
    $logger: HasLogger,
    $repository: HasRepository,
    $uuid: HasUuid,
  })(
    ({ $eventStore, $logger, $repository, $uuid }) =>
      (event) =>
        pipe(
          gen(function* (_) {
            const seats = event.seats.rows * event.seats.columns
            const projection = yield* _(
              $ScreeningProjection()(
                {
                  filmName: '',
                  screenName: '',
                  date: event.date,
                  seats: { total: seats, free: seats },
                },
                {
                  id: event.aggregateId,
                  date: { created: event._.date, updated: event._.date },
                },
              ),
            )

            yield* _($ScreeningProjection.save(projection))
          }),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
