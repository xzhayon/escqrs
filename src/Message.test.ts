import { Effect, pipe } from '@effect-ts/core'
import { $Layer } from '../config/Layer.testing'
import { Body } from './Entity'
import { $Message, $MessageId, Message } from './Message'

describe('Message', () => {
  it('creating a message', async () => {
    const date = new Date()

    await expect(
      pipe(
        $Message('foo')({ aggregateId: 'bar', mad: 'max' } as Body<Message>, {
          id: $MessageId('bar'),
          correlationId: $MessageId('mad'),
          causationId: $MessageId('max'),
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
  it('inheriting correlation and causation ID from message ID', async () => {
    const date = new Date()

    await expect(
      pipe(
        $Message('foo')({ aggregateId: 'bar', mad: 'max' } as Body<Message>, {
          id: $MessageId('bar'),
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
  it('inheriting correlation and causation ID from previous message', async () => {
    const date = new Date()

    await expect(
      pipe(
        $Message('foo')({ aggregateId: 'bar', mad: 'max' } as Body<Message>, {
          id: $MessageId('bar'),
          correlationId: $MessageId('mad'),
          causationId: $MessageId('max'),
          date,
        })({
          _: {
            type: 'foo',
            id: $MessageId('BAR'),
            correlationId: $MessageId('MAD'),
            causationId: $MessageId('MAX'),
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
