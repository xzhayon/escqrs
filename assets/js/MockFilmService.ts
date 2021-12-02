import { Array, Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Film, Film } from '../../app/arcadia/Film'
import { Body } from '../../src/Entity'
import { HasUuid, Uuid } from '../../src/Uuid'
import { FilmService } from './FilmService'

export const $MockFilmService =
  ({ $uuid }: { $uuid: Uuid }) =>
  (films: Array.Array<Body<Film>> = []): FilmService => {
    const _films: Film[] = []
    const seed = pipe(
      gen(function* (_) {
        for (const film of films) {
          _films.push(yield* _($Film()(film)))
        }
      }),
      Effect.provideService(HasUuid)($uuid),
      Effect.runPromise,
    )

    return {
      create: async (film) => {
        await seed
        await pipe(
          Effect.succeedWith(() => _films.push(film)),
          Effect.delay(3000),
          Effect.runPromise,
        )
      },
      getMany: async () => {
        await seed

        return await pipe(
          Effect.succeed(_films),
          Effect.delay(3000),
          Effect.runPromise,
        )
      },
    }
  }
