import { Effect, Has, pipe } from '@effect-ts/core'
import { $Logger } from './Logger'

const CHANNEL = 'Storage'

export interface Storage {
  readonly readStream: (path: string) => Effect.IO<Error, NodeJS.ReadableStream>
  readonly read: (path: string) => Effect.IO<Error, Buffer>
  readonly writeStream: (
    path: string,
    options?: WriteOptions,
  ) => Effect.IO<Error, NodeJS.WritableStream>
  readonly write: (
    path: string,
    options?: WriteOptions,
  ) => (data: Buffer) => Effect.IO<Error, void>
  readonly delete: (path: string) => Effect.IO<Error, void>
}

type WriteOptions = { readonly append?: boolean }

export const HasStorage = Has.tag<Storage>()

const _storage = Effect.deriveLifted(HasStorage)(
  ['readStream', 'read', 'writeStream', 'delete'],
  [],
  ['write'],
)

const readStream = (path: string) =>
  pipe(
    path,
    _storage.readStream,
    Effect.tapBoth(
      (error) =>
        $Logger.error('Readable stream not opened', {
          filePath: path,
          error,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Readable stream opened', {
          filePath: path,
          channel: CHANNEL,
        }),
    ),
  )

const read = (path: string) =>
  pipe(
    path,
    _storage.read,
    Effect.tapBoth(
      (error) =>
        $Logger.error('File not read', {
          filePath: path,
          error,
          channel: CHANNEL,
        }),
      (data) =>
        $Logger.debug('File read', {
          filePath: path,
          fileSize: data.length,
          channel: CHANNEL,
        }),
    ),
  )

const writeStream = (path: string, options?: WriteOptions) =>
  pipe(
    _storage.writeStream(path, options),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Writable stream not opened', {
          filePath: path,
          error,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('Writable stream opened', {
          filePath: path,
          channel: CHANNEL,
        }),
    ),
  )

const write = (path: string, options?: WriteOptions) => (data: Buffer) =>
  pipe(
    _storage.write,
    Effect.map((f) => f(path, options)),
    Effect.ap(Effect.succeed(data)),
    Effect.flatten,
    Effect.tapBoth(
      (error) =>
        $Logger.error('File not written', {
          filePath: path,
          error,
          fileSize: data.length,
          channel: CHANNEL,
        }),
      () =>
        $Logger.debug('File written', {
          filePath: path,
          fileSize: data.length,
          channel: CHANNEL,
        }),
    ),
  )

const _delete = (path: string) =>
  pipe(
    path,
    _storage.delete,
    Effect.tapBoth(
      (error) =>
        $Logger.error('File not deleted', {
          filePath: path,
          error,
          channel: CHANNEL,
        }),
      () => $Logger.debug('File deleted', { filePath: path, channel: CHANNEL }),
    ),
  )

export const $Storage = {
  readStream,
  read,
  writeStream,
  write,
  delete: _delete,
}
