import { Effect, Managed, pipe } from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { gen } from '@effect-ts/system/Effect'
import { join } from 'path'
import { $Logger, HasLogger } from '../../logger/Logger'
import { FileNotFound } from '../../storage/FileNotFound'
import { $Storage, HasStorage } from '../../storage/Storage'
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
        find: ({ _: { type, id } }) =>
          pipe(
            $Storage.read(getLocation(location, type, id)),
            Effect.mapError((error) =>
              error instanceof FileNotFound
                ? EntityNotFound.build(type, id)
                : error,
            ),
            Effect.map((buffer) => JSON.parse(buffer.toString())),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          ),
        update: (entity) =>
          pipe(
            repository.find(entity),
            Effect.map((_entity) => ({ ..._entity, ...entity })),
            Effect.tap((_entity) =>
              pipe(
                JSON.stringify(_entity),
                Buffer.from,
                $Storage.write(
                  getLocation(location, _entity._.type, _entity._.id),
                ),
              ),
            ),
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
