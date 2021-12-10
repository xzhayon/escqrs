import { Array } from '@effect-ts/core'
import { Film } from '../app/arcadia/Film'
import { Screen } from '../app/arcadia/Screen'
import { Body, Header, Id } from '../src/entity/Entity'
import { PartialDeep } from '../src/PartialDeep'

export interface ArcadiaClient {
  readonly createScreen: (screen: Screen) => Promise<void>
  readonly getScreens: () => Promise<Array.Array<Screen>>
  readonly getScreen: (id: Id<Screen>) => Promise<Screen>
  readonly editScreen: (
    screen: {
      _: Pick<Header<Screen>, 'id'>
    } & PartialDeep<Body<Screen>>,
  ) => Promise<Screen>
  readonly createFilm: (film: Film) => Promise<void>
  readonly getFilms: () => Promise<Array.Array<Film>>
  readonly getFilm: (id: Id<Film>) => Promise<Film>
  readonly editFilm: (
    film: { _: Pick<Header<Film>, 'id'> } & PartialDeep<Screen>,
  ) => Promise<Film>
}
