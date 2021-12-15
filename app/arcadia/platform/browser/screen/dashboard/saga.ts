import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { ArcadiaClient } from '../../ArcadiaClient'
import { $ScreenDashboard } from './slice'

function* fetchScreens(
  command: ReturnType<typeof $ScreenDashboard.fetchScreens>,
) {
  yield* put($ScreenDashboard.ScreensFetchingStarted())
  try {
    const arcadia = yield* getContext<ArcadiaClient>('arcadiaClient')
    const screens = yield* call(arcadia.getScreens)
    yield* put($ScreenDashboard.ScreensFetched(screens))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, screens))
  } catch (error: any) {
    yield* put($ScreenDashboard.ScreensNotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

export function* $ScreenDashboardSaga() {
  yield* takeLeading($ScreenDashboard.start.type, function* () {
    yield* put($ScreenDashboard.Started())
    const task = yield* takeLeading(
      $ScreenDashboard.fetchScreens.type,
      fetchScreens,
    )
    yield* put($ScreenDashboard.fetchScreens())
    yield* take($ScreenDashboard.stop.type)
    yield* cancel(task)
    yield* put($ScreenDashboard.Stopped())
  })
}
