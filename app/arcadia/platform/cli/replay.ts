import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import { $Layer } from '../../../../config/Layer.local'
import { $EventStore } from '../../../../src/entity/message/event/eventstore/EventStore'
import { $ScreeningsByFilm } from '../../projection/ScreeningsByFilm'

const handlers = [$ScreeningsByFilm.onScreeningCreated]

pipe(
  gen(function* (_) {
    for (const eventHandler of handlers) {
      yield* _($EventStore.subscribe(yield* _(eventHandler)))
    }

    yield* _($EventStore.run)
  }),
  Effect.provideSomeLayer($Layer),
  Effect.runPromise,
)
