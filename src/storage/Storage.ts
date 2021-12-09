import { Array, Effect, Has, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import { $Logger } from '../logger/Logger'
import { DirectoryNotFound } from './DirectoryNotFound'
import { FileNotFound } from './FileNotFound'

const CHANNEL = 'Storage'

const File = 0b1
const Directory = 0b10
export interface Storage {
  readonly list: (
    path: string,
    type?: number,
  ) => Effect.IO<DirectoryNotFound | Error, Array.Array<string>>
  readonly exists: (path: string, type?: number) => Effect.IO<Error, boolean>
  readonly readStream: (
    path: string,
  ) => Effect.IO<FileNotFound | Error, NodeJS.ReadableStream>
  readonly read: (path: string) => Effect.IO<FileNotFound | Error, Buffer>
  readonly writeStream: (
    path: string,
    options?: WriteOptions,
  ) => Effect.IO<Error, NodeJS.WritableStream>
  readonly write: (
    path: string,
    options?: WriteOptions,
  ) => (data: Buffer) => Effect.IO<Error, void>
  readonly delete: (path: string) => Effect.IO<FileNotFound | Error, void>
}

type WriteOptions = { readonly append?: boolean }

export const HasStorage = Has.tag<Storage>()

const _storage = Effect.deriveLifted(HasStorage)(
  ['list', 'exists', 'readStream', 'read', 'writeStream', 'delete'],
  [],
  ['write'],
)

const list = (path: string, type = File | Directory) =>
  pipe(
    _storage.list(path, type),
    Effect.tapBoth(
      (error) =>
        $Logger.error('Files not listed', {
          filePath: path,
          error,
          channel: CHANNEL,
        }),
      (paths) =>
        $Logger.debug('Files listed', {
          filePath: path,
          filesCount: paths.length,
          channel: CHANNEL,
        }),
    ),
  )

const exists = (path: string, type = File | Directory) =>
  pipe(
    _storage.exists(path, type),
    Effect.tapBoth(
      (error) =>
        $Logger.error('File not found', {
          filePath: path,
          error,
          channel: CHANNEL,
        }),
      (exists) =>
        $Logger.debug(`File${exists ? '' : ' not'} found`, {
          filePath: path,
          channel: CHANNEL,
        }),
    ),
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
    gen(function* (_) {
      const _write = yield* _(_storage.write)

      return yield* _(_write(path, options)(data))
    }),
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
  File,
  Directory,
  list,
  exists,
  readStream,
  read,
  writeStream,
  write,
  delete: _delete,
}
