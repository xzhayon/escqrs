import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/core/Effect'
import { $Layer } from '../../../../config/Layer.local'
import { $EventStore } from '../../../../src/entity/message/event/eventstore/EventStore'
import { $ScreeningProjection } from '../../projection/Screening'

const handlers = [$ScreeningProjection.onScreeningCreated]

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
