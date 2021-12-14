import { gen } from '@effect-ts/core/Effect'
import * as t from 'io-ts'
import { $Repository } from '../../../../../../src/entity/repository/Repository'
import { $HttpServer } from '../../../../../../src/http/server/HttpServer'
import {
  $ScreeningProjectionC,
  ScreeningProjection,
} from '../../../../projection/Screening'

export const GetScreenings = $HttpServer.get(
  '/api/v1/screenings',
  { response: t.type({ data: t.readonlyArray($ScreeningProjectionC) }) },
  () =>
    gen(function* (_) {
      const screenings = yield* _(
        $Repository.find<ScreeningProjection>({
          _: { type: '_Projection.Screening' },
        }),
      )

      return { data: screenings }
    }),
)
