import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'
import _fs from 'fs'
import { fs } from 'memfs'
import { $Layer } from '../config/Layer.testing'
import { FileNotFound } from './FileNotFound'
import { $Fs } from './Fs'
import { $Storage, HasStorage } from './Storage'

describe('Storage', () => {
  describe.each([
    [
      'Fs',
      () =>
        pipe(
          $Layer,
          Layer.and(
            Layer.fromValue(HasStorage)($Fs(fs as unknown as typeof _fs)),
          ),
          Layer.main,
        ),
    ],
  ])('%s', (_, layer) => {
    let seed = -1

    beforeEach(() => {
      seed++
    })

    it('checking for a nonexistent file', async () => {
      await expect(
        pipe(
          $Storage.exists(`foo.${seed}`),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).resolves.toBeFalsy()
    })
    it('checking for an existent file', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Storage.write(`foo.${seed}`)(Buffer.from('bar')))

            return yield* _($Storage.exists(`foo.${seed}`))
          }),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).resolves.toBeTruthy()
    })
    it('reading stream of a nonexistent file', async () => {
      await expect(
        pipe(
          $Storage.readStream(`foo.${seed}`),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).rejects.toThrow(FileNotFound.build(`foo.${seed}`))
    })
    it('reading a nonexistent file', async () => {
      await expect(
        pipe(
          $Storage.read(`foo.${seed}`),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).rejects.toThrow(FileNotFound.build(`foo.${seed}`))
    })
    it('writing to a file', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Storage.write(`foo.${seed}`)(Buffer.from('bar')))

            return yield* _($Storage.read(`foo.${seed}`))
          }),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).resolves.toStrictEqual(Buffer.from('bar'))
    })
    it('writing to a nonexistent directory', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Storage.write(`foo.${seed}/bar`)(Buffer.from('foobar')))

            return yield* _($Storage.read(`foo.${seed}/bar`))
          }),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).resolves.toStrictEqual(Buffer.from('foobar'))
    })
    it('replacing a file', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Storage.write(`foo.${seed}/bar`)(Buffer.from('foo')))
            yield* _($Storage.write(`foo.${seed}/bar`)(Buffer.from('bar')))

            return yield* _($Storage.read(`foo.${seed}/bar`))
          }),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).resolves.toStrictEqual(Buffer.from('bar'))
    })
    it('appending to a file', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Storage.write(`foo.${seed}/bar`)(Buffer.from('foo')))
            yield* _(
              $Storage.write(`foo.${seed}/bar`, { append: true })(
                Buffer.from('bar'),
              ),
            )

            return yield* _($Storage.read(`foo.${seed}/bar`))
          }),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).resolves.toStrictEqual(Buffer.from('foobar'))
    })
    it('deleting a nonexistent file', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            return yield* _($Storage.delete(`foo.${seed}`))
          }),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).rejects.toThrow(FileNotFound.build(`foo.${seed}`))
    })
    it('deleting a file', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Storage.write(`foo.${seed}/bar`)(Buffer.from('foobar')))
            yield* _($Storage.delete(`foo.${seed}/bar`))

            return yield* _($Storage.exists(`foo.${seed}/bar`))
          }),
          Effect.provideSomeLayer(layer()),
          Effect.runPromise,
        ),
      ).resolves.toBeFalsy()
    })
  })
})
