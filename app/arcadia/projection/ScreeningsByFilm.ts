import { Array, Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import * as t from 'io-ts'
import { DateFromISOString } from 'io-ts-types'
import { $Aggregate } from '../../../src/Aggregate'
import { Id } from '../../../src/entity/Entity'
import { Event } from '../../../src/entity/message/event/Event'
import { $EventHandler } from '../../../src/entity/message/event/EventHandler'
import {
  $MutableEntity,
  $MutableEntityC,
} from '../../../src/entity/MutableEntity'
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

$ScreeningsByFilm.create = (
  filmId: Id<Film>,
  filmTitle: string,
  event?: Event,
) =>
  $ScreeningsByFilm()(
    { filmId: filmId, filmTitle: filmTitle, screenings: [] },
    { id: filmId, date: { created: event?._.date } },
  )

$ScreeningsByFilm.addScreening = (
  projection: ScreeningsByFilm,
  screeningId: Id<Screening>,
  date: Date,
  screenId: Id<Screen>,
  screenName: string,
  seats: number,
) => ({
  ...projection,
  screenings: projection.screenings
    .filter((screening) => screeningId !== screening.screeningId)
    .concat({
      screeningId,
      date,
      screenId,
      screenName,
      seats: { total: seats, free: seats },
    }),
})

$ScreeningsByFilm.onScreeningCreated = $EventHandler<ScreeningCreated>(
  'ScreeningCreated',
  'UpdateScreeningsByFilm',
)((event) =>
  gen(function* (_) {
    const projection = yield* _(
      pipe(
        $ScreeningsByFilm.load(event.filmId),
        Effect.orElse(() =>
          $ScreeningsByFilm.create(event.filmId, event.filmTitle, event),
        ),
      ),
    )

    const seats = event.seats.rows * event.seats.columns
    const _projection = $ScreeningsByFilm.addScreening(
      projection,
      event.aggregateId,
      event.date,
      event.screenId,
      event.screenName,
      seats,
    )

    yield* _($ScreeningsByFilm.save(_projection))
  }),
)
