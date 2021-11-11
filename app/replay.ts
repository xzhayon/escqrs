import { Array, Effect, pipe } from '@effect-ts/core'
import * as Layer from '@effect-ts/system/Layer'
import EventEmitter from 'events'
import fs from 'fs'
import { $InMemoryRepository } from '../src/core/entities/repositories/InMemoryRepository'
import { HasRepository } from '../src/core/entities/Repository'
import { $Logger, HasLogger } from '../src/core/Logger'
import { $Console } from '../src/core/loggers/Console'
import { HasServiceBus } from '../src/core/messages/commands/ServiceBus'
import { $InMemoryServiceBus } from '../src/core/messages/commands/serviceBuses/InMemoryServiceBus'
import {
  $EventStore,
  HasEventStore,
} from '../src/core/messages/events/EventStore'
import { $StorageEventStore } from '../src/core/messages/events/eventStores/StorageEventStore'
import { HasStorage } from '../src/core/Storage'
import { $Fs } from '../src/core/storages/Fs'
import { HasUuid } from '../src/core/Uuid'
import { $Rfc4122 } from '../src/core/uuids/Rfc4122'
import { $ScreeningCreated } from '../src/domain/screening/events/ScreeningCreated'
import { $SeatsReserved } from '../src/domain/screening/events/SeatsReserved'

pipe(
  [
    $ScreeningCreated.updateScreeningProjection,
    $SeatsReserved.expireReservation,
    $SeatsReserved.updateScreeningProjection,
  ] as any,
  Array.sequence(Effect.Applicative),
  Effect.tap(Array.mapEffectPar($EventStore.subscribe as any)),
  Effect.tap(() => $EventStore.run),
  Effect.provideSomeLayer(
    Layer.all(
      Layer.fromManaged(HasEventStore)(
        $StorageEventStore('var/eventstore', () => new EventEmitter(), true),
      ),
      Layer.fromManaged(HasRepository)($InMemoryRepository),
      Layer.fromManaged(HasServiceBus)(
        $InMemoryServiceBus(() => new EventEmitter()),
      ),
    ),
  ),
  Effect.provideSomeLayer(
    Layer.all(
      Layer.pure(HasLogger)(pipe($Console(true), $Logger.level('debug'))),
      Layer.pure(HasStorage)($Fs(fs)),
      Layer.pure(HasUuid)($Rfc4122),
    ),
  ),
  Effect.run,
)
