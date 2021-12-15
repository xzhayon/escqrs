import { Array, Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types'
import { $Aggregate } from '../../../src/Aggregate'
import { Id } from '../../../src/entity/Entity'
import { $EventHandler } from '../../../src/entity/message/event/EventHandler'
import { HasEventStore } from '../../../src/entity/message/event/eventstore/EventStore'
import {
  $MutableEntity,
  $MutableEntityC,
} from '../../../src/entity/MutableEntity'
import { HasRepository } from '../../../src/entity/repository/Repository'
import { HasLogger } from '../../../src/logger/Logger'
import { HasUuid } from '../../../src/uuid/Uuid'
import { Film } from '../film/Film'
import { Screen } from '../screen/Screen'
import { ScreeningCreated } from '../screening/event/ScreeningCreated'
import { Screening } from '../screening/Screening'
import { Projection } from './Projection'

export interface ScreeningsByFilm
  extends Projection<'ScreeningsByFilm', Id<Film>> {
  readonly filmId: Id<Film>
  readonly filmTitle: string
  readonly screenings: Array.Array<{
    readonly screeningId: Id<Screening>
    readonly date: Date
    readonly screenId: Id<Screen>
    readonly screenName: string
    readonly seats: { readonly total: number; readonly free: number }
  }>
}

export const $ScreeningsByFilmC: t.Type<ScreeningsByFilm> = t.intersection(
  [
    t.readonly(
      t.type({
        filmId: t.string as t.Mixed,
        filmTitle: t.string,
        screenings: t.readonlyArray(
          t.readonly(
            t.type({
              screeningId: t.string as t.Mixed,
              date: DateFromISOString as t.Mixed,
              screenId: t.string as t.Mixed,
              screenName: t.string,
              seats: t.readonly(t.type({ total: t.number, free: t.number })),
            }),
          ),
        ),
      }),
      'Body',
    ),
    $MutableEntityC(
      t.literal('_Projection.ScreeningsByFilm') as t.Mixed,
      t.string as t.Mixed,
    ),
  ],
  'ScreeningProjection',
)

const aggregate = $Aggregate<ScreeningsByFilm>('_Projection.ScreeningsByFilm')

export function $ScreeningsByFilm() {
  return $MutableEntity<ScreeningsByFilm>('_Projection.ScreeningsByFilm')
}

$ScreeningsByFilm.id = aggregate.id
$ScreeningsByFilm.load = aggregate.load
$ScreeningsByFilm.save = aggregate.save
$ScreeningsByFilm.delete = aggregate.delete

$ScreeningsByFilm.onScreeningCreated = $EventHandler<ScreeningCreated>(
  'ScreeningCreated',
  'UpdateScreeningsByFilm',
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
            const projection = yield* _(
              pipe(
                $ScreeningsByFilm.load(event.filmId),
                Effect.orElse(() =>
                  $ScreeningsByFilm()(
                    {
                      filmId: event.filmId,
                      filmTitle: event.filmTitle,
                      screenings: [],
                    },
                    {
                      id: event.filmId,
                      date: { created: event._.date, updated: event._.date },
                    },
                  ),
                ),
              ),
            )

            const seats = event.seats.rows * event.seats.columns
            const _projection = {
              ...projection,
              screenings: projection.screenings
                .filter(({ screeningId }) => event.aggregateId !== screeningId)
                .concat({
                  screeningId: event.aggregateId,
                  date: event.date,
                  screenId: event.screenId,
                  screenName: event.screenName,
                  seats: { total: seats, free: seats },
                }),
            }

            yield* _($ScreeningsByFilm.save(_projection))
          }),
          Effect.provideService(HasEventStore)($eventStore),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
          Effect.provideService(HasUuid)($uuid),
        ),
  ),
)
