import { gen } from '@effect-ts/core/Effect'
import * as t from 'io-ts'
import { $Repository } from '../../../../../../src/entity/repository/Repository'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import {
  $ScreeningsByFilmC,
  ScreeningsByFilm,
} from '../../../../projection/ScreeningsByFilm'

export const GetScreeningsByFilm = $HttpServer.get(
  '/api/v1/screenings-by-film',
  { response: t.type({ data: t.readonlyArray($ScreeningsByFilmC) }) },
  () =>
    gen(function* (_) {
      const screeningsByFilm = yield* _(
        $Repository.find<ScreeningsByFilm>({
          _: { type: '_Projection.ScreeningsByFilm' },
        }),
      )

      return { data: screeningsByFilm }
    }),
)
