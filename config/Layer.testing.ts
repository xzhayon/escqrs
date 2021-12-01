import { pipe } from '@effect-ts/core'
import * as Layer from '@effect-ts/system/Layer'
import EventEmitter from 'events'
import { HasEventStore } from '../src/EventStore'
import { $Fs } from '../src/Fs'
import { $InMemoryEventStore } from '../src/InMemoryEventStore'
import { $InMemoryRepository } from '../src/InMemoryRepository'
import { $InMemoryServiceBus } from '../src/InMemoryServiceBus'
import { HasLogger } from '../src/Logger'
import { $NilLogger } from '../src/NilLogger'
import { HasRepository } from '../src/Repository'
import { $Rfc4122 } from '../src/Rfc4122'
import { HasServiceBus } from '../src/ServiceBus'
import { HasStorage } from '../src/Storage'
import { fs } from 'memfs'
import _fs from 'fs'
import { HasUuid } from '../src/Uuid'

export const $Layer = pipe(
  Layer.all(
    Layer.fromManaged(HasEventStore)(
      $InMemoryEventStore(() => new EventEmitter()),
    ),
    Layer.fromManaged(HasRepository)($InMemoryRepository),
    Layer.fromManaged(HasServiceBus)(
      $InMemoryServiceBus(() => new EventEmitter()),
    ),
    Layer.pure(HasStorage)($Fs(fs as unknown as typeof _fs)),
    Layer.pure(HasUuid)($Rfc4122),
  ),
  Layer.usingAnd(Layer.pure(HasLogger)($NilLogger)),
  Layer.main,
)
