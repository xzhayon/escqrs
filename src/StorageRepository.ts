import { Effect, Managed, pipe } from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { join } from 'path'
import { $Logger, HasLogger } from './Logger'
import { $Storage, HasStorage } from './Storage'
import { Repository } from './Repository'
import { gen } from '@effect-ts/system/Effect'

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
            Effect.map((buffer) => JSON.parse(buffer.toString())),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          ),
        update: (entity) =>
          pipe(
            $storage.read(getLocation(location, entity._.type, entity._.id)),
            Effect.map((_entity) => ({
              ...JSON.parse(_entity.toString()),
              ...entity,
            })),
            Effect.tap((_entity) =>
              pipe(
                JSON.stringify(_entity),
                Buffer.from,
                $Storage.write(
                  getLocation(location, entity._.type, entity._.id),
                ),
              ),
            ),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          ),
        delete: (entity) =>
          pipe(
            $storage.read(getLocation(location, entity._.type, entity._.id)),
            Effect.tap(() =>
              $Storage.delete(
                getLocation(location, entity._.type, entity._.id),
              ),
            ),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasStorage)($storage),
          ),
      }
    }),
    Managed.make(() =>
      $Logger.debug('Connection to storage repository closed', {
        storagePath: location,
        channel: CHANNEL,
      }),
    ),
  )
