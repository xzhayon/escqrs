import { Array } from '@effect-ts/core'
import { Film } from '../app/arcadia/Film'
import { Screen } from '../app/arcadia/Screen'
import { DeepPartial } from '../src/DeepPartial'
import { Body, Header, Id } from '../src/entity/Entity'

export interface ArcadiaClient {
  readonly createScreen: (
    screen: { _: Pick<Header<Screen>, 'id'> } & Body<Screen>,
  ) => Promise<Screen>
  readonly getScreens: () => Promise<Array.Array<Screen>>
  readonly getScreen: (id: Id<Screen>) => Promise<Screen>
  readonly editScreen: (
    screen: {
      _: Pick<Header<Screen>, 'id'>
    } & DeepPartial<Body<Screen>>,
  ) => Promise<Screen>
  readonly createFilm: (film: Film) => Promise<Film>
  readonly getFilms: () => Promise<Array.Array<Film>>
  readonly getFilm: (id: Id<Film>) => Promise<Film>
  readonly editFilm: (
    film: { _: Pick<Header<Film>, 'id'> } & DeepPartial<Film>,
  ) => Promise<Film>
}
