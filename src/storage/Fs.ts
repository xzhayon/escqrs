import { Array, Effect, Option, pipe } from '@effect-ts/core'
import _fs from 'fs'
import { dirname } from 'path'
import { $Error } from '../Error'
import { FileNotFound } from './FileNotFound'
import { Storage } from './Storage'

export const $Fs = (
  fs: Pick<
    typeof _fs,
    | 'access'
    | 'createReadStream'
    | 'createWriteStream'
    | 'promises'
    | 'readdir'
    | 'readFile'
    | 'unlink'
    | 'writeFile'
  >,
): Storage => ({
  list: (path) =>
    pipe(
      path,
      Effect.fromNodeCb<string, Error, Array.Array<string>>(fs.readdir),
      Effect.mapError((error) =>
        /^ENOENT/.test(error.message) ? FileNotFound.build(path) : error,
      ),
    ),
  exists: (path) =>
    pipe(
      path,
      Effect.fromNodeCb(fs.access),
      Effect.as(true),
      Effect.catchSome((error) =>
        /^ENOENT/.test(error.message)
          ? Option.some(Effect.succeed(false))
          : Option.none,
      ),
    ),
  readStream: (path) =>
    pipe(
      Effect.tryCatchPromise(
        () =>
          new Promise<NodeJS.ReadableStream>((resolve, reject) => {
            const stream: NodeJS.ReadableStream = fs
              .createReadStream(path)
              .on('error', reject)
              .on('open', () => resolve(stream))
          }),
        $Error.fromUnknown(
          Error(`Cannot open readable stream for file "${path}"`),
        ),
      ),
      Effect.mapError((error) =>
        /^ENOENT/.test(error.message) ? FileNotFound.build(path) : error,
      ),
    ),
  read: (path) =>
    pipe(
      path,
      Effect.fromNodeCb(fs.readFile),
      Effect.mapError((error) =>
        /^ENOENT/.test(error.message) ? FileNotFound.build(path) : error,
      ),
    ),
  writeStream: (path, options) =>
    Effect.tryCatchPromise(async () => {
      await fs.promises.mkdir(dirname(path), { recursive: true })

      return new Promise((resolve, reject) => {
        const stream: NodeJS.WritableStream = fs
          .createWriteStream(path, { flags: options?.append ? 'a' : 'w' })
          .on('error', reject)
          .on('open', () => resolve(stream))
      })
    }, $Error.fromUnknown(Error(`Cannot open writable stream for file "${path}"`))),
  write: (path, options) => (data) =>
    Effect.tryCatchPromise(async () => {
      await fs.promises.mkdir(dirname(path), { recursive: true })

      return new Promise((resolve, reject) =>
        fs.writeFile(
          path,
          data,
          { flag: options?.append ? 'a' : 'w' },
          (error) => (error ? reject(error) : resolve()),
        ),
      )
    }, $Error.fromUnknown(Error(`Cannot write to file "${path}"`))),
  delete: (path) =>
    pipe(
      path,
      Effect.fromNodeCb(fs.unlink),
      Effect.mapError((error) =>
        /^ENOENT/.test(error.message) ? FileNotFound.build(path) : error,
      ),
    ),
})
