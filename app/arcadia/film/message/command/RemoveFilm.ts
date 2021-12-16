import {
  $Command,
  Command,
} from '../../../../../src/entity/message/command/Command'
import { $CommandHandler } from '../../../../../src/entity/message/command/CommandHandler'
import { $Film, Film } from '../../Film'

export interface RemoveFilm extends Command<Film, 'RemoveFilm'> {}

export function $RemoveFilm() {
  return $Command<RemoveFilm>('RemoveFilm')
}

$RemoveFilm.handler = $CommandHandler<RemoveFilm>('RemoveFilm')((command) =>
  $Film.delete(command.aggregateId),
)
