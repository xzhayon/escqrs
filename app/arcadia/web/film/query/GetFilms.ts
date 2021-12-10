import { gen } from '@effect-ts/system/Effect'
import * as t from 'io-ts'
import { $Repository } from '../../../../../src/entity/repository/Repository'
import { $HttpServer } from '../../../../../src/http/server/HttpServer'
import { $FilmC, Film } from '../../../Film'

export const $GetFilms = $HttpServer.get(
  '/api/v1/films',
  { response: t.type({ data: t.readonlyArray($FilmC) }) },
  () =>
    gen(function* (_) {
      const films = yield* _($Repository.find<Film>({ _: { type: 'Film' } }))

      return { data: films }
    }),
)
