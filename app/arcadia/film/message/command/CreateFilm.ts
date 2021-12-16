import { gen } from '@effect-ts/core/Effect'
import {
  $Command,
  Command,
} from '../../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../../src/entity/message/command/CommandHandler'
import { $Film, Film } from '../../Film'

export interface CreateFilm extends Command<Film, 'CreateFilm'> {
  readonly title: string
}

export function $CreateFilm() {
  return $Command<CreateFilm>('CreateFilm')
}

$CreateFilm.handler = $CommandHandler<CreateFilm>('CreateFilm')((command) =>
  gen(function* (_) {
    const film = yield* _($Film.create(command.aggregateId, command.title))
    yield* _($Film.save(film))
  }),
)
