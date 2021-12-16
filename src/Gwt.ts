import { Array, Effect, Function, pipe } from '@effect-ts/core'
import * as Layer from '@effect-ts/core/Effect/Layer'
import { DefaultEnv, gen } from '@effect-ts/system/Effect'
import { $Layer } from '../config/Layer.testing'
import { ROutOf } from './Effect'
import { Command } from './entity/message/command/Command'
import { CommandHandler } from './entity/message/command/CommandHandler'
import { Event } from './entity/message/event/Event'
import { $EventStore } from './entity/message/event/eventstore/EventStore'
import { Message } from './entity/message/Message'

type GwtEnv = DefaultEnv & ROutOf<typeof $Layer>

const stripMessageHeaders = <A extends Message>({ _, ...message }: A) => ({
  ...message,
  _: { type: _.type },
})

export class Gwt<R, S extends 'Given' | 'When' | 'Then' | 'Run'> {
  private readonly _S!: S
  private _given: Effect.Effect<any, Error, Array.Array<Event>>
  private _when!: Effect.Effect<any, Error, Command>
  private _error!: Error
  private _then: Array.Array<Effect.Effect<any, Error, Event>>

  private constructor(private readonly _handler: CommandHandler<any>) {
    this._given = Effect.succeed([])
    this._then = []
  }

  static test<_R>(handler: CommandHandler<GwtEnv & _R>): Gwt<_R, 'Given'> {
    return new Gwt<_R, 'Given'>(handler)
  }

  given<_R>(
    this: Gwt<R, 'Given'>,
    event: Effect.Effect<GwtEnv & _R, Error, Event>,
    ...events: Array.Array<Effect.Effect<GwtEnv & _R, Error, Event>>
  ): Gwt<R & _R, 'When'>
  given<_R>(
    this: Gwt<R, 'Given'>,
    effect: Effect.Effect<GwtEnv & _R, Error, void>,
  ): Gwt<R & _R, 'Given'>
  given<_R>(
    this: Gwt<R, 'Given'>,
    effectOrEvent: Effect.Effect<any, Error, void | Event>,
    ...events: Array.Array<Effect.Effect<any, Error, Event>>
  ): Gwt<R & _R, 'Given' | 'When'> {
    const given = this._given
    this._given = gen(function* (_) {
      const _events: Array<Event> = []
      for (const _effectOrEvent of [effectOrEvent, ...events]) {
        const a = yield* _(_effectOrEvent)
        if (undefined !== a) {
          _events.push(a)
        }
      }

      return [...(yield* _(given)), ..._events]
    })

    return this as Gwt<R & _R, any>
  }

  when<_R>(
    this: Gwt<R, 'Given' | 'When'>,
    command: Effect.Effect<GwtEnv & _R, Error, Command>,
  ): Gwt<R & _R, 'Then'> {
    this._when = command

    return this as Gwt<R & _R, any>
  }

  then(this: Gwt<R, 'Then'>, error: Error): Gwt<R, 'Run'>
  then<_R>(
    this: Gwt<R, 'Then'>,
    event: Effect.Effect<GwtEnv & _R, Error, Event>,
    ...events: Array.Array<Effect.Effect<GwtEnv & _R, Error, Event>>
  ): Gwt<R & _R, 'Run'>
  then<_R>(
    this: Gwt<R, 'Then'>,
    errorOrEvent: Error | Effect.Effect<GwtEnv & _R, Error, Event>,
    ...events: Array.Array<Effect.Effect<GwtEnv & _R, Error, Event>>
  ): Gwt<R & _R, 'Run'> {
    if (errorOrEvent instanceof Error) {
      this._error = errorOrEvent
    } else {
      this._then = [errorOrEvent, ...events]
    }

    return this as Gwt<R & _R, any>
  }

  async run(this: Gwt<GwtEnv, 'Run'>): Promise<void>
  async run(
    this: Gwt<R, 'Run'>,
    layer: Layer.Layer<GwtEnv, Error, R>,
  ): Promise<void>
  async run(
    this: Gwt<GwtEnv | R, 'Run'>,
    layer: Layer.Layer<GwtEnv, Error, R> = Layer.identity<any>(),
  ): Promise<void> {
    const handler = this._handler
    const given = this._given
    const when = this._when

    const expected = this._error
      ? this._error
      : await pipe(
          this._then,
          Array.mapEffectPar(Function.identity),
          Effect.map(Array.map(stripMessageHeaders)),
          Effect.provideSomeLayer(layer),
          Effect.provideLayer($Layer),
          Effect.runPromise,
        )

    const actual = pipe(
      gen(function* (_) {
        const command = yield* _(when)

        const events = yield* _(given)
        for (const event of events) {
          yield* _($EventStore.publish(event))
        }
        const pointer = (yield* _($EventStore.events(command.aggregateId)))
          .length

        yield* _(handler.handle(command))

        return (yield* _($EventStore.events(command.aggregateId))).slice(
          pointer,
        )
      }),
      Effect.map(Array.map(stripMessageHeaders)),
      Effect.provideSomeLayer(layer),
      Effect.provideLayer($Layer),
      Effect.runPromise,
    )

    return expected instanceof Error
      ? expect(actual).rejects.toStrictEqual(expected)
      : expect(actual).resolves.toStrictEqual(expected)
  }
}
