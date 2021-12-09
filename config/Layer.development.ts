import { pipe } from '@effect-ts/core'
import * as Layer from '@effect-ts/system/Layer'
import EventEmitter from 'events'
import fs from 'fs'
import { HasEventStore } from '../src/entity/message/event/eventstore/EventStore'
import { $StorageEventStore } from '../src/entity/message/event/eventstore/StorageEventStore'
import { HasRepository } from '../src/entity/repository/Repository'
import { $StorageRepository } from '../src/entity/repository/StorageRepository'
import { $Console } from '../src/logger/Console'
import { HasLogger } from '../src/logger/Logger'
import { $Fs } from '../src/storage/Fs'
import { HasStorage } from '../src/storage/Storage'
import { $Layer as $Layer_testing } from './Layer.testing'

export const $Layer = pipe(
  Layer.all(
    $Layer_testing,
    Layer.fromManaged(HasEventStore)(
      $StorageEventStore('./var/eventstore', () => new EventEmitter()),
    ),
    Layer.fromManaged(HasRepository)($StorageRepository('./var/repository')),
  ),
  Layer.usingAnd(Layer.fromValue(HasLogger)($Console())),
  Layer.usingAnd(Layer.fromValue(HasStorage)($Fs(fs))),
  Layer.main,
)
