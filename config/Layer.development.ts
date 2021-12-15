import { pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'
import dotenv from 'dotenv'
import EventEmitter from 'events'
import fastify from 'fastify'
import fastifyCors from 'fastify-cors'
import fs from 'fs'
import * as t from 'io-ts'
import { NumberFromString } from 'io-ts-types'
import { $Any } from '../src/Any'
import { HasEventStore } from '../src/entity/message/event/eventstore/EventStore'
import { $StorageEventStore } from '../src/entity/message/event/eventstore/StorageEventStore'
import { HasRepository } from '../src/entity/repository/Repository'
import { $StorageRepository } from '../src/entity/repository/StorageRepository'
import { $FastifyHttpServer } from '../src/http/server/FastifyHttpServer'
import { HasHttpServer } from '../src/http/server/HttpServer'
import { $Console } from '../src/logger/Console'
import { HasLogger } from '../src/logger/Logger'
import { $Fs } from '../src/storage/Fs'
import { HasStorage } from '../src/storage/Storage'
import { $Layer as $Layer_testing } from './Layer.testing'

dotenv.config()

export const $Layer = pipe(
  gen(function* (_) {
    return yield* _(
      $Any.decode(
        t.intersection(
          [
            t.type({
              EVENT_STORE_PATH: t.string,
              REPOSITORY_PATH: t.string,
            }),
            t.partial({
              EVENT_STORE_REPLAY: NumberFromString.pipe($Any.booleanFromBit),
              HTTP_PORT: NumberFromString,
              HTTP_ADDRESS: t.string,
            }),
          ],
          'Environment',
        ),
      )({
        ...process.env,
        ...(undefined !== process.argv[2]
          ? { HTTP_PORT: process.argv[2] }
          : null),
      }),
    )
  }),
  Layer.fromRawEffect,
  Layer.chain((env) =>
    pipe(
      Layer.all(
        $Layer_testing,
        Layer.fromManaged(HasEventStore)(
          $StorageEventStore(
            env.EVENT_STORE_PATH,
            () => new EventEmitter(),
            env.EVENT_STORE_REPLAY,
          ),
        ),
        Layer.fromManaged(HasHttpServer)(
          $FastifyHttpServer(
            () => fastify().register(fastifyCors),
            env.HTTP_PORT,
            env.HTTP_ADDRESS,
          ),
        ),
        Layer.fromEffect(HasRepository)(
          $StorageRepository(env.REPOSITORY_PATH),
        ),
      ),
      Layer.usingAnd(Layer.fromValue(HasLogger)($Console(true))),
      Layer.usingAnd(Layer.fromValue(HasStorage)($Fs(fs))),
    ),
  ),
  Layer.main,
)
