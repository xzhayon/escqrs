import { Effect, pipe } from '@effect-ts/core'
import _fs from 'fs'
import { dirname } from 'path'
import { $Error } from '../Error'
import { Storage } from '../Storage'

export const $Fs = (fs: typeof _fs): Storage => ({
  readStream: (path) =>
    Effect.tryCatchPromise(
      () =>
        new Promise((resolve, reject) => {
          const stream: NodeJS.ReadableStream = fs
            .createReadStream(path)
            .on('error', reject)
            .on('open', () => resolve(stream))
        }),
      $Error.fromUnknown(
        Error(`Cannot open readable stream for file "${path}"`),
      ),
    ),
  read: (path) => pipe(path, Effect.fromNodeCb(fs.readFile)),
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
  delete: (path) => pipe(path, Effect.fromNodeCb(fs.rm)),
})
