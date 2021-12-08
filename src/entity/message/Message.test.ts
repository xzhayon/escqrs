import { Effect, pipe } from '@effect-ts/core'
import { $Layer } from '../../../config/Layer.testing'
import { Body } from '../Entity'
import { $Message, Message } from './Message'

describe('Message', () => {
  test('creating a message', async () => {
    const date = new Date()

    await expect(
      pipe(
        $Message('foo')({ aggregateId: 'bar', mad: 'max' } as Body<Message>, {
          id: $Message.id('bar'),
          correlationId: $Message.id('mad'),
          causationId: $Message.id('max'),
          date,
        })(),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).resolves.toStrictEqual({
      _: {
        type: 'foo',
        id: 'bar',
        correlationId: 'mad',
        causationId: 'max',
        date,
      },
      aggregateId: 'bar',
      mad: 'max',
    })
  })
  test('inheriting correlation and causation ID from message ID', async () => {
    const date = new Date()

    await expect(
      pipe(
        $Message('foo')({ aggregateId: 'bar', mad: 'max' } as Body<Message>, {
          id: $Message.id('bar'),
          date,
        })(),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).resolves.toStrictEqual({
      _: {
        type: 'foo',
        id: 'bar',
        correlationId: 'bar',
        causationId: 'bar',
        date,
      },
      aggregateId: 'bar',
      mad: 'max',
    })
  })
  test('inheriting correlation and causation ID from previous message', async () => {
    const date = new Date()

    await expect(
      pipe(
        $Message('foo')({ aggregateId: 'bar', mad: 'max' } as Body<Message>, {
          id: $Message.id('bar'),
          correlationId: $Message.id('mad'),
          causationId: $Message.id('max'),
          date,
        })({
          _: {
            type: 'foo',
            id: $Message.id('BAR'),
            correlationId: $Message.id('MAD'),
            causationId: $Message.id('MAX'),
            date,
          },
          aggregateId: 'bar',
        }),
        Effect.provideSomeLayer($Layer),
        Effect.runPromise,
      ),
    ).resolves.toStrictEqual({
      _: {
        type: 'foo',
        id: 'bar',
        correlationId: 'MAD',
        causationId: 'BAR',
        date,
      },
      aggregateId: 'bar',
      mad: 'max',
    })
  })
})
