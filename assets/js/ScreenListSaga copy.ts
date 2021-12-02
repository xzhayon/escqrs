import {
  call,
  cancel,
  getContext,
  put,
  take,
  takeLeading,
} from 'typed-redux-saga'
import { ScreenList } from './ScreenListSlice'
import { ScreenService } from './ScreenService'

function* screenScreens(command: ReturnType<typeof ScreenList['Fetch']>) {
  yield* put(ScreenList.FetchStarted())
  try {
    const screenService: ScreenService = yield getContext('screenService')
    const Screens = yield* call(screenService.getMany)
    yield* put(ScreenList.Fetched(Screens))
    command.payload?.onSuccess &&
      (yield* call(command.payload.onSuccess, Screens))
  } catch (error: any) {
    yield* put(ScreenList.NotFetched(error))
    command.payload?.onFailure &&
      (yield* call(command.payload.onFailure, error))
  }
}

export function* $ScreenListSaga() {
  yield* takeLeading(ScreenList.Start.type, function* () {
    yield* put(ScreenList.Started())
    const task = yield* takeLeading(ScreenList.Fetch.type, screenScreens)
    yield* put(ScreenList.Fetch())
    yield* take(ScreenList.Stop.type)
    yield* cancel(task)
    yield* put(ScreenList.Stopped())
  })
}
