import { Branded, Clock, Effect, pipe } from '@effect-ts/core'
import { $Uuid } from '../Uuid'
import { $Repository, HasRepository } from './Repository'

export interface Entity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> {
  readonly _: H & { readonly type: T; readonly id: I }
}

export interface ImmutableEntity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> extends Entity<T, I, H & { readonly date: Date }> {}

export interface MutableEntity<
  T extends string = string,
  I extends string = string,
  H extends object = object,
> extends Entity<
    T,
    I,
    H & { readonly dateCreated: Date; readonly dateUpdated: Date }
  > {}

export function $Entity<A extends Entity>(type: A['_']['type']) {
  return (
    body: Omit<A, '_' | keyof Branded.Brand<any>>,
    header?: Partial<Omit<A['_'], 'type'>>,
  ) =>
    pipe(
      header?.id ? Effect.succeed(header.id) : $Uuid.v4,
      Effect.map(
        (id): A => ({ ...body, _: { ...header, type, id } } as Entity as A),
      ),
    )
}

export function $ImmutableEntity<A extends ImmutableEntity>(
  type: A['_']['type'],
) {
  return (
    body: Omit<A, '_' | keyof Branded.Brand<any>>,
    header?: Partial<Omit<A['_'], 'type'>>,
  ) =>
    pipe(
      header?.date
        ? Effect.succeed(header.date)
        : pipe(
            Clock.currentTime,
            Effect.map((currentTime) => new Date(currentTime)),
          ),
      Effect.chain((date) =>
        $Entity(type)(body, { ...header, date } as Partial<
          Omit<A['_'], 'type'>
        >),
      ),
    )
}

export function $MutableEntity<A extends MutableEntity>(type: A['_']['type']) {
  return (
    body: Omit<A, '_' | keyof Branded.Brand<any>>,
    header?: Partial<Omit<A['_'], 'type'>>,
  ) =>
    pipe(
      header?.dateCreated
        ? Effect.succeed(header.dateCreated)
        : pipe(
            Clock.currentTime,
            Effect.map((currentTime) => new Date(currentTime)),
          ),
      Effect.chain((date) =>
        $Entity(type)(body, {
          ...header,
          dateCreated: date,
          dateUpdated: date,
        } as Partial<Omit<A['_'], 'type'>>),
      ),
    )
}

$Entity.create = <A extends Entity>(entity: A) =>
  pipe(
    Effect.service(HasRepository),
    Effect.chain((repository) => repository.find(entity)),
    Effect.foldM(
      () => $Repository.insert(entity),
      () =>
        Effect.fail(
          Error(
            `Cannot create duplicate entity "${entity._.id}" of type "${entity._.type}"`,
          ),
        ),
    ),
  )

$Entity.read =
  <A extends Entity>(type: A['_']['type']) =>
  (id: A['_']['id']) =>
    $Repository.find({ _: { type, id } })

$Entity.update = $Repository.update

$Entity.delete = $Repository.delete
