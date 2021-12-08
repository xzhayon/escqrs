import { pipe } from '@effect-ts/core'
import * as Layer from '@effect-ts/system/Layer'
import EventEmitter from 'events'
import fs from 'fs'
import { $Console } from '../src/Console'
import { HasEventStore } from '../src/EventStore'
import { $Fs } from '../src/Fs'
import { HasLogger } from '../src/Logger'
import { HasRepository } from '../src/Repository'
import { HasStorage } from '../src/Storage'
import { $StorageEventStore } from '../src/StorageEventStore'
import { $StorageRepository } from '../src/StorageRepository'
import { $Layer as $Layer_testing } from './Layer.testing'

export const $Layer = pipe(
  Layer.all(
    $Layer_testing,
    Layer.fromManaged(HasEventStore)(
      $StorageEventStore('./var/eventstore', () => new EventEmitter()),
    ),
    Layer.fromManaged(HasRepository)($StorageRepository('./var/repository')),
  ),
  Layer.usingAnd(Layer.fromValue(HasLogger)($Console(true))),
  Layer.usingAnd(Layer.fromValue(HasStorage)($Fs(fs))),
  Layer.main,
)
