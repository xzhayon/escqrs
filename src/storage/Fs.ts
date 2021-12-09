import { Array, Effect, Option, pipe } from '@effect-ts/core'
import _fs, { Stats } from 'fs'
import { dirname, join } from 'path'
import { $Error } from '../Error'
import { DirectoryNotFound } from './DirectoryNotFound'
import { FileNotFound } from './FileNotFound'
import { $Storage, Storage } from './Storage'

export const $Fs = (
  fs: Pick<
    typeof _fs,
    | 'createReadStream'
    | 'createWriteStream'
    | 'lstat'
    | 'promises'
    | 'readdir'
    | 'readFile'
    | 'unlink'
    | 'writeFile'
  >,
): Storage => {
  const storage: Storage = {
    list: (path, type = $Storage.File | $Storage.Directory) =>
      pipe(
        path,
        Effect.fromNodeCb<string, Error, Array.Array<string>>(fs.readdir),
        Effect.chain(
          Array.compactF(Effect.Applicative)((fileName) =>
            pipe(
              storage.exists(join(path, fileName), type),
              Effect.ifM(
                () => Effect.succeed(Option.some(fileName)),
                () => Effect.succeed(Option.none),
              ),
            ),
          ),
        ),
        Effect.mapError((error) =>
          /^ENOENT/.test(error.message) ? DirectoryNotFound.build(path) : error,
        ),
      ),
    exists: (path, type = $Storage.File | $Storage.Directory) =>
      pipe(
        path,
        Effect.fromNodeCb<string, Error, Stats>(fs.lstat),
        Effect.map(
          (stats) =>
            ((type & $Storage.File) > 0 && stats.isFile()) ||
            ((type & $Storage.Directory) > 0 && stats.isDirectory()),
        ),
        Effect.catchSome((error) =>
          /^ENOENT/.test(error.message)
            ? Option.some(Effect.succeed(false))
            : /^EISDIR/.test(error.message)
            ? Option.some(Effect.succeed((type & $Storage.Directory) > 0))
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
  }

  return storage
}
