import { Array, Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Film, Film } from '../app/arcadia/Film'
import { $Screen, Screen } from '../app/arcadia/Screen'
import { Body } from '../src/entity/Entity'
import { HasUuid, Uuid } from '../src/uuid/Uuid'
import { ArcadiaClient } from './ArcadiaClient'

export const $MockArcadiaClient =
  ({ $uuid }: { $uuid: Uuid }) =>
  (
    screens: Array.Array<Body<Screen>> = [],
    films: Array.Array<Body<Film>>,
  ): ArcadiaClient => {
    const _screens: Screen[] = []
    const _films: Film[] = []
    const seed = pipe(
      gen(function* (_) {
        for (const screen of screens) {
          _screens.push(yield* _($Screen()(screen)))
        }
        for (const film of films) {
          _films.push(yield* _($Film()(film)))
        }
      }),
      Effect.provideService(HasUuid)($uuid),
      Effect.runPromise,
    )

    return {
      createScreen: async (screen) => {
        await seed
        await pipe(
          Effect.succeedWith(() => _screens.push(screen)),
          Effect.delay(3000),
          Effect.runPromise,
        )
      },
      getScreens: async () => {
        await seed

        return await pipe(
          Effect.succeed(_screens),
          Effect.delay(3000),
          Effect.runPromise,
        )
      },
      createFilm: async (film) => {
        await seed
        await pipe(
          Effect.succeedWith(() => _films.push(film)),
          Effect.delay(3000),
          Effect.runPromise,
        )
      },
      getFilms: async () => {
        await seed

        return await pipe(
          Effect.succeed(_films),
          Effect.delay(3000),
          Effect.runPromise,
        )
      },
    }
  }
