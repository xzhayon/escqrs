import {
  Array,
  Effect,
  Equal,
  Managed,
  Option,
  pipe,
  Record,
} from '@effect-ts/core'
import { HasClock } from '@effect-ts/system/Clock'
import { gen } from '@effect-ts/system/Effect'
import { join } from 'path'
import { $Logger, HasLogger } from '../../logger/Logger'
import { DirectoryNotFound } from '../../storage/DirectoryNotFound'
import { FileNotFound } from '../../storage/FileNotFound'
import { $Storage, HasStorage } from '../../storage/Storage'
import { Body, Entity, Header } from '../Entity'
import { EntityNotFound } from './EntityNotFound'
import { Repository } from './Repository'

const CHANNEL = 'StorageRepository'

const getLocation = (directory: string, type: string, id?: string) =>
  undefined !== id
    ? join(
        directory,
        ...type.toLowerCase().split('.'),
        `${id.toLowerCase()}.json`,
      )
    : join(directory, ...type.toLowerCase().split('.'))

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
              if (undefined !== header.id) {
                const buffer = yield* _(
                  $Storage.read(getLocation(location, header.type, header.id)),
                )
                const entity = JSON.parse(buffer.toString())

                return [entity as A]
              }

              const fileNames = yield* _(
                $Storage.list(
                  getLocation(location, header.type),
                  $Storage.File,
                ),
              )
              const entities = []
              for (const fileName of fileNames) {
                const buffer = yield* _(
                  $Storage.read(
                    join(getLocation(location, header.type), fileName),
                  ),
                )
                const entity = JSON.parse(buffer.toString())
                if (pipe(body, Record.isSubrecord(Equal.strict())(entity))) {
                  entities.push(entity)
                }
              }

              return entities
            }),
            Effect.mapError((error) =>
              undefined !== header.id && error instanceof FileNotFound
                ? EntityNotFound.build(header.type, header.id)
                : error,
            ),
            Effect.catchSome((error) =>
              error instanceof DirectoryNotFound
                ? Option.some(Effect.succeed([]))
                : Option.none,
            ),
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
            $Storage.exists(
              getLocation(location, entity._.type, entity._.id),
              $Storage.File,
            ),
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
