import { runSaga, stdChannel, Task } from 'redux-saga'
import { EventEmitter } from 'stream'
import { $Film } from '../../../../../film/Film'
import { $Screen } from '../../../../../screen/Screen'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { Uuid } from '../../../uuid/Uuid'
import { $ScreeningCreationSaga } from './saga'
import { $ScreeningCreation } from './slice'

describe('ScreeningCreationSaga', () => {
  const filmId = $Film.id('filmId')
  const date = new Date()
  const screenId = $Screen.id('screenId')
  const error = Error()
  const creations: unknown[] = []
  const arcadiaClient: Pick<
    ArcadiaClient,
    'getFilms' | 'getScreens' | 'createScreening'
  > = {
    getFilms: async () => [],
    getScreens: async () => [],
    createScreening: async (screeningId, filmId, screenId, date) => {
      creations.push({ screeningId, filmId, screenId, date })
    },
  }
  const uuid: Uuid = { v4: async () => 'uuid' }

  let events: unknown[]
  const channel = stdChannel()
  let task: Task
  const emitter = new EventEmitter()
  emitter
    .on('message', (message) => {
      ;/\/[A-Z]/.test(message.type) && events.push(message)
      channel.put(message)
    })
    .on(
      'message',
      (message) =>
        $ScreeningCreation.FilmsAndScreensFetched.type === message.type &&
        emitter.emit(
          'message',
          $ScreeningCreation.createScreening({ filmId, date, screenId }),
        ),
    )
    .on(
      'message',
      (message) =>
        $ScreeningCreation.Stopped.type === message.type && task.cancel(),
    )
    .on(
      'message',
      (message) =>
        ($ScreeningCreation.FilmsAndScreensNotFetched.type === message.type ||
          $ScreeningCreation.ScreeningCreationRejected.type === message.type ||
          $ScreeningCreation.ScreeningCreationAccepted.type === message.type) &&
        emitter.emit('message', $ScreeningCreation.stop()),
    )

  beforeEach(() => {
    events = []
  })

  test('failing film fetching', async () => {
    task = runSaga(
      {
        channel,
        dispatch: (message) => emitter.emit('message', message),
        context: {
          arcadiaClient: {
            ...arcadiaClient,
            getFilms: async () => {
              throw error
            },
          },
          uuid,
        },
      },
      $ScreeningCreationSaga,
    )
    emitter.emit('message', $ScreeningCreation.start())
    await task.toPromise()

    expect(events).toStrictEqual([
      $ScreeningCreation.Started(),
      $ScreeningCreation.FilmsAndScreensFetchingStarted(),
      $ScreeningCreation.FilmsAndScreensNotFetched(error),
      $ScreeningCreation.Stopped(),
    ])
  })
  test('failing screen fetching', async () => {
    task = runSaga(
      {
        channel,
        dispatch: (message) => emitter.emit('message', message),
        context: {
          arcadiaClient: {
            ...arcadiaClient,
            getScreens: async () => {
              throw error
            },
          },
          uuid,
        },
      },
      $ScreeningCreationSaga,
    )
    emitter.emit('message', $ScreeningCreation.start())
    await task.toPromise()

    expect(events).toStrictEqual([
      $ScreeningCreation.Started(),
      $ScreeningCreation.FilmsAndScreensFetchingStarted(),
      $ScreeningCreation.FilmsAndScreensNotFetched(error),
      $ScreeningCreation.Stopped(),
    ])
  })

  describe('films and screens were fetched', () => {
    test('failing screening creation', async () => {
      task = runSaga(
        {
          channel,
          dispatch: (message) => emitter.emit('message', message),
          context: {
            arcadiaClient: {
              ...arcadiaClient,
              createScreening: async () => {
                throw error
              },
            },
            uuid,
          },
        },
        $ScreeningCreationSaga,
      )
      emitter.emit('message', $ScreeningCreation.start())
      await task.toPromise()

      expect(events).toStrictEqual([
        $ScreeningCreation.Started(),
        $ScreeningCreation.FilmsAndScreensFetchingStarted(),
        $ScreeningCreation.FilmsAndScreensFetched({ films: [], screens: [] }),
        $ScreeningCreation.ScreeningCreationRequested(),
        $ScreeningCreation.ScreeningCreationRejected(error),
        $ScreeningCreation.Stopped(),
      ])
    })
    test('creating screening', async () => {
      task = runSaga(
        {
          channel,
          dispatch: (message) => emitter.emit('message', message),
          context: { arcadiaClient, uuid },
        },
        $ScreeningCreationSaga,
      )
      emitter.emit('message', $ScreeningCreation.start())
      await task.toPromise()

      expect(events).toStrictEqual([
        $ScreeningCreation.Started(),
        $ScreeningCreation.FilmsAndScreensFetchingStarted(),
        $ScreeningCreation.FilmsAndScreensFetched({ films: [], screens: [] }),
        $ScreeningCreation.ScreeningCreationRequested(),
        $ScreeningCreation.ScreeningCreationAccepted(),
        $ScreeningCreation.Stopped(),
      ])
      expect(creations).toStrictEqual([
        { screeningId: 'uuid', filmId, date, screenId },
      ])
    })
  })
})
