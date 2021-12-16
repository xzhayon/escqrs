import { EventEmitter } from 'events'
import { runSaga, stdChannel, Task } from 'redux-saga'
import { $Film, Film } from '../../../../../film/Film'
import { ArcadiaClient } from '../../../ArcadiaClient'
import { $FilmEditingSaga } from './saga'
import { $FilmEditing } from './slice'

describe('FilmEditingSaga', () => {
  const filmId = $Film.id('filmId')
  const filmTitle = 'filmTitle'
  const film: Film = {
    _: {
      type: 'Film',
      id: filmId,
      date: { created: new Date(), updated: new Date() },
      version: 0,
    },
    title: 'filmTitle',
  }
  const error = Error()
  const editings: unknown[] = []
  const arcadiaClient: Pick<ArcadiaClient, 'getFilm' | 'editFilm'> = {
    getFilm: async () => film,
    editFilm: async (id, body) => {
      editings.push({ id, body })
    },
  }

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
        $FilmEditing.FilmFetched.type === message.type &&
        emitter.emit('message', $FilmEditing.editFilm({ title: filmTitle })),
    )
    .on(
      'message',
      (message) => $FilmEditing.Stopped.type === message.type && task.cancel(),
    )
    .on(
      'message',
      (message) =>
        ($FilmEditing.FilmNotFetched.type === message.type ||
          $FilmEditing.FilmEditingRejected.type === message.type ||
          $FilmEditing.FilmEditingAccepted.type === message.type) &&
        emitter.emit('message', $FilmEditing.stop()),
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
            getFilm: async () => {
              throw error
            },
          },
        },
      },
      $FilmEditingSaga,
    )
    emitter.emit('message', $FilmEditing.start({ id: filmId }))
    await task.toPromise()

    expect(events).toStrictEqual([
      $FilmEditing.Started(),
      $FilmEditing.FilmFetchingStarted(),
      $FilmEditing.FilmNotFetched(error),
      $FilmEditing.Stopped(),
    ])
  })

  describe('film was fetched', () => {
    test('failing film editing', async () => {
      task = runSaga(
        {
          channel,
          dispatch: (message) => emitter.emit('message', message),
          context: {
            arcadiaClient: {
              ...arcadiaClient,
              editFilm: async () => {
                throw error
              },
            },
          },
        },
        $FilmEditingSaga,
      )
      emitter.emit('message', $FilmEditing.start({ id: filmId }))
      await task.toPromise()

      expect(events).toStrictEqual([
        $FilmEditing.Started(),
        $FilmEditing.FilmFetchingStarted(),
        $FilmEditing.FilmFetched(film),
        $FilmEditing.FilmEditingRequested(),
        $FilmEditing.FilmEditingRejected(error),
        $FilmEditing.Stopped(),
      ])
    })
    test('editing film', async () => {
      task = runSaga(
        {
          channel,
          dispatch: (message) => emitter.emit('message', message),
          context: { arcadiaClient },
        },
        $FilmEditingSaga,
      )
      emitter.emit('message', $FilmEditing.start({ id: filmId }))
      await task.toPromise()

      expect(events).toStrictEqual([
        $FilmEditing.Started(),
        $FilmEditing.FilmFetchingStarted(),
        $FilmEditing.FilmFetched(film),
        $FilmEditing.FilmEditingRequested(),
        $FilmEditing.FilmEditingAccepted(),
        $FilmEditing.Stopped(),
      ])
      expect(editings).toStrictEqual([
        { id: filmId, body: { title: filmTitle } },
      ])
    })
  })
})
