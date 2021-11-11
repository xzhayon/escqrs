import { Branded, Effect, pipe } from '@effect-ts/core'
import { AggregateId } from '../aggregates/Aggregate'
import { $ImmutableEntity, ImmutableEntity } from '../entities/Entity'
import { $Uuid } from '../Uuid'

export interface Message<A extends string = string>
  extends ImmutableEntity<
    A,
    MessageId,
    { readonly correlationId: CorrelationId; readonly causationId: CausationId }
  > {
  readonly aggregateId: AggregateId
}

export type MessageId = Branded.Branded<string, 'MessageId'>
export type CorrelationId = Branded.Branded<string, 'CorrelationId'>
export type CausationId = Branded.Branded<string, 'CausationId'>

export const $MessageId = (id: string) => id as MessageId
export const $CorrelationId = (id: string) => id as CorrelationId
export const $CausationId = (id: string) => id as CausationId

export function $Message<A extends Message>(type: A['_']['type']) {
  return (
      body: Omit<A, '_' | keyof Branded.Brand<any>>,
      header?: Partial<Omit<A['_'], 'type'>>,
    ) =>
    <B extends Message>(cause?: B) =>
      pipe(
        Effect.do,
        Effect.bind('id', () =>
          header?.id
            ? Effect.succeed(header.id)
            : pipe($Uuid.v4, Effect.map($MessageId)),
        ),
        Effect.let(
          'correlationId',
          ({ id }) => header?.correlationId ?? $CorrelationId(id),
        ),
        Effect.let(
          'causationId',
          ({ id }) => header?.causationId ?? $CausationId(id),
        ),
        Effect.chain(({ id, correlationId, causationId }) =>
          $ImmutableEntity(type)(body, {
            ...header,
            id,
            correlationId,
            causationId,
          } as Partial<Omit<A['_'], 'type'>>),
        ),
        Effect.map((message) =>
          cause
            ? {
                ...message,
                _: {
                  ...message._,
                  correlationId: cause._.correlationId,
                  causationId: $CausationId(cause._.id),
                },
              }
            : message,
        ),
      )
}
