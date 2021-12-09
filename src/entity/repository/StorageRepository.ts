import { Array, Effect, Managed, pipe } from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { gen } from '@effect-ts/system/Effect'
import { join } from 'path'
import { $Logger, HasLogger } from '../../logger/Logger'
import { $Storage, HasStorage } from '../../storage/Storage'
import { Body, Entity, Header } from '../Entity'
import { EntityNotFound } from './EntityNotFound'
import { Repository } from './Repository'

const CHANNEL = 'StorageRepository'

const getLocation = (directory: string, type: string, id: string) =>
  join(directory, ...type.toLowerCase().split('.'), `${id.toLowerCase()}.json`)

export const $StorageRepository = (location: string) =>
  pipe(
    gen(function* (_) {
      const $clock = yield* _(HasClock)
      const $logger = yield* _(HasLogger)
      const $storage = yield* _(HasStorage)

      yield* _(
        $Logger.debug('Connection to storage repository opened', {
          storagePath: location,
          channel: CHANNEL,
        }),
      )

      const repository: Repository = {
        insert: (entity) =>
          pipe(
            JSON.stringify(entity),
            Buffer.from,
            $Storage.write(getLocation(location, entity._.type, entity._.id)),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          ),
        find: <A extends Entity>({
          _: header,
          ...body
        }: {
          readonly _: Pick<Header<A>, 'type'> & Partial<Header<A>>
        } & Partial<Body<A>>) =>
          pipe(
            gen(function* (_) {
              if (
                undefined !== header.id &&
                (yield* _(
                  $Storage.exists(
                    getLocation(location, header.type, header.id),
                  ),
                ))
              ) {
                const buffer = yield* _(
                  $Storage.read(getLocation(location, header.type, header.id)),
                )
                const entity = JSON.parse(buffer.toString())

                return [entity as A]
              }

              return Array.emptyOf<A>()
            }),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          ),
        update: (entity) =>
          pipe(
            gen(function* (_) {
              const entities = yield* _(repository.find(entity))
              const _entity = yield* _(Array.head(entities), () =>
                EntityNotFound.build(entity._.type, entity._.id),
              )
              const __entity = { ..._entity, ...entity }
              const buffer = Buffer.from(JSON.stringify(__entity))
              yield* _(
                $Storage.write(
                  getLocation(location, entity._.type, entity._.id),
                )(buffer),
              )

              return __entity
            }),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          ),
        delete: (entity) =>
          pipe(
            $Storage.exists(getLocation(location, entity._.type, entity._.id)),
            Effect.ifM(
              () =>
                $Storage.delete(
                  getLocation(location, entity._.type, entity._.id),
                ),
              () =>
                Effect.fail(EntityNotFound.build(entity._.type, entity._.id)),
            ),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          ),
      }

      return repository
    }),
    Managed.make(() =>
      $Logger.debug('Connection to storage repository closed', {
        storagePath: location,
        channel: CHANNEL,
      }),
    ),
  )
