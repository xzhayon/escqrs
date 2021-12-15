import { Effect, pipe } from '@effect-ts/core'
import {
  $Command,
  Command,
} from '../../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../../src/entity/message/command/CommandHandler'
import { HasRepository } from '../../../../../src/entity/repository/Repository'
import { HasLogger } from '../../../../../src/logger/Logger'
import { $Film, Film } from '../../Film'

export interface RemoveFilm extends Command<Film, 'RemoveFilm'> {}

export function $RemoveFilm() {
  return $Command<RemoveFilm>('RemoveFilm')
}

$RemoveFilm.handler = $CommandHandler<RemoveFilm>('RemoveFilm')(
  Effect.accessServices({ $logger: HasLogger, $repository: HasRepository })(
    ({ $logger, $repository }) =>
      (command) =>
        pipe(
          $Film.delete(command.aggregateId),
          Effect.provideService(HasLogger)($logger),
          Effect.provideService(HasRepository)($repository),
        ),
  ),
)
