import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { $ScreenDashboard } from './slice'
import { ScreenService } from '../ScreenService'

function* fetchList(command: ReturnType<typeof $ScreenDashboard['FetchList']>) {
  yield* put($ScreenDashboard.ListFetchingStarted())
  try {
    const screenService: ScreenService = yield getContext('screenService')
    const Screens = yield* call(screenService.getList)
    yield* put($ScreenDashboard.ListFetched(Screens))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, Screens))
  } catch (error: any) {
    yield* put($ScreenDashboard.ListNotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

export function* $ScreenDashboardSaga() {
  yield* takeLeading($ScreenDashboard.Start.type, function* () {
    yield* put($ScreenDashboard.Started())
    const task = yield* takeLeading($ScreenDashboard.FetchList.type, fetchList)
    yield* put($ScreenDashboard.FetchList())
    yield* take($ScreenDashboard.Stop.type)
    yield* cancel(task)
    yield* put($ScreenDashboard.Stopped())
  })
}
