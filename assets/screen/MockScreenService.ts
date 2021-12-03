import { Array, Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Screen, Screen } from '../../app/arcadia/Screen'
import { Body } from '../../src/Entity'
import { HasUuid, Uuid } from '../../src/Uuid'
import { ScreenService } from './ScreenService'

export const $MockScreenService =
  ({ $uuid }: { $uuid: Uuid }) =>
  (screens: Array.Array<Body<Screen>> = []): ScreenService => {
    const _films: Screen[] = []
    const seed = pipe(
      gen(function* (_) {
        for (const screen of screens) {
          _films.push(yield* _($Screen()(screen)))
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
      getList: async () => {
        await seed

        return await pipe(
          Effect.succeed(_films),
          Effect.delay(3000),
          Effect.runPromise,
        )
      },
    }
  }
