import { pipe } from '@effect-ts/core'
import * as Layer from '@effect-ts/system/Layer'
import EventEmitter from 'events'
import { HasEventStore } from '../src/EventStore'
import { $InMemoryEventStore } from '../src/InMemoryEventStore'
import { $InMemoryRepository } from '../src/InMemoryRepository'
import { $InMemoryServiceBus } from '../src/InMemoryServiceBus'
import { HasLogger } from '../src/Logger'
import { $NilLogger } from '../src/NilLogger'
import { HasRepository } from '../src/Repository'
import { $Rfc4122 } from '../src/Rfc4122'
import { HasServiceBus } from '../src/ServiceBus'
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
    Layer.pure(HasUuid)($Rfc4122),
  ),
  Layer.usingAnd(Layer.pure(HasLogger)($NilLogger)),
  Layer.main,
)
