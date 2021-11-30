import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Layer } from '../../config/Layer.local'
import { $Event } from '../../src/Event'
import { $EventStore } from '../../src/EventStore'
import { $Uuid } from '../../src/Uuid'

pipe(
  gen(function* (_) {
    const aggregateId = yield* _($Uuid.v4)
    const event = yield* _($Event('foo')({ aggregateId })())
    yield* _($EventStore.publish(event))
  }),
  Effect.provideSomeLayer($Layer),
  Effect.run,
)
