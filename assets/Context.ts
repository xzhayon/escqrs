import { $Rfc4122 } from '../src/Rfc4122'
import { $MockFilmService } from './film/MockFilmService'
import { $MockScreenService } from './screen/MockScreenService'
import { $Rfc4122UuidService } from './Rfc4122UuidService'

export type Context = typeof $Context

export const $Context = {
  filmService: $MockFilmService({ $uuid: $Rfc4122 })([
    { title: 'Dune: Part One' },
    { title: 'The Matrix Resurrections' },
    { title: 'Dune: Part Two' },
  ]),
  screenService: $MockScreenService({ $uuid: $Rfc4122 })([
    { name: 'Energia', seats: { rows: 16, columns: 40 } },
  ]),
  uuidService: $Rfc4122UuidService({ $uuid: $Rfc4122 }),
}
