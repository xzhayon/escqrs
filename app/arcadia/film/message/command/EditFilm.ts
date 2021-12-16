import { gen } from '@effect-ts/core/Effect'
import {
  $Command,
  Command,
} from '../../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../../src/entity/message/command/CommandHandler'
import { $Film, Film } from '../../Film'

export interface EditFilm extends Command<Film, 'EditFilm'> {
  readonly title?: string
}

export function $EditFilm() {
  return $Command<EditFilm>('EditFilm')
}

$EditFilm.handler = $CommandHandler<EditFilm>('EditFilm')((command) =>
  gen(function* (_) {
    const film = yield* _($Film.load(command.aggregateId))
    const _film = $Film.edit(film, { title: command.title })
    yield* _($Film.save(_film))
  }),
)
