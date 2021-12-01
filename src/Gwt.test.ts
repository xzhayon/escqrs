import { Effect } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Command } from './Command'
import { $CommandHandler } from './CommandHandler'
import { $Event } from './Event'
import { Gwt } from './Gwt'

const handler = $CommandHandler('foo')(
  Effect.succeed((command) => Effect.fail(Error(command._.type))),
)

describe('Gwt', () => {
  it('calling `given` multiple times', async () => {
    let a = 0
    let b = 0

    await Gwt.test(handler)
      .given(
        gen(function* (_) {
          yield* _(
            Effect.succeedWith(() => {
              a += 42
            }),
          )
        }),
      )
      .given(
        gen(function* (_) {
          yield* _(
            Effect.succeedWith(() => {
              b += 1138
            }),
          )
        }),
      )
      .given($Event('foo')({ aggregateId: 'bar' })())
      .when($Command('foo')({ aggregateId: 'bar' })())
      .then(Error('foo'))
      .run()

    expect([a, b]).toStrictEqual([42, 1138])
  })
})
