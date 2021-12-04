import { Array } from '@effect-ts/core'
import { Film } from '../app/arcadia/Film'
import { Screen } from '../app/arcadia/Screen'

export interface ArcadiaClient {
  readonly createScreen: (screen: Screen) => Promise<void>
  readonly getScreens: () => Promise<Array.Array<Screen>>
  readonly createFilm: (film: Film) => Promise<void>
  readonly getFilms: () => Promise<Array.Array<Film>>
}
