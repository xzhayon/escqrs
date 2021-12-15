import { Array } from '@effect-ts/core'
import { DeepPartial } from '../../../../src/DeepPartial'
import { Body, Id } from '../../../../src/entity/Entity'
import { Film } from '../../film/Film'
import { ScreeningsByFilm } from '../../projection/ScreeningsByFilm'
import { Screen } from '../../screen/Screen'
import { Screening } from '../../screening/Screening'

export interface ArcadiaClient {
  readonly createFilm: (id: Id<Film>, title: string) => Promise<void>
  readonly editFilm: (
    id: Id<Film>,
    body: DeepPartial<Body<Film>>,
  ) => Promise<void>
  readonly removeFilm: (id: Id<Film>) => Promise<void>
  readonly getFilms: () => Promise<Array.Array<Film>>
  readonly getFilm: (id: Id<Film>) => Promise<Film>
  readonly createScreen: (id: Id<Screen>, body: Body<Screen>) => Promise<Screen>
  readonly editScreen: (
    id: Id<Screen>,
    body: DeepPartial<Body<Screen>>,
  ) => Promise<Screen>
  readonly removeScreen: (id: Id<Screen>) => Promise<void>
  readonly getScreens: () => Promise<Array.Array<Screen>>
  readonly getScreen: (id: Id<Screen>) => Promise<Screen>
  readonly createScreening: (
    screeningId: Id<Screening>,
    filmId: Id<Film>,
    screenId: Id<Screen>,
    date: Date,
  ) => Promise<void>
  readonly getScreeningsByFilm: () => Promise<Array.Array<ScreeningsByFilm>>
}
