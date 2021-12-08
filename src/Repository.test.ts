import { Effect, pipe } from '@effect-ts/core'
import { gen } from '@effect-ts/system/Effect'
import * as Layer from '@effect-ts/system/Layer'
import _fs from 'fs'
import { fs } from 'memfs'
import { tmpdir } from 'os'
import { resolve } from 'path'
import { $Layer } from '../config/Layer.testing'
import { Entity } from './Entity'
import { EntityNotFound } from './EntityNotFound'
import { $Fs } from './Fs'
import { $InMemoryRepository } from './InMemoryRepository'
import { HasLogger } from './Logger'
import { $NilLogger } from './NilLogger'
import { $Repository, HasRepository } from './Repository'
import { HasStorage } from './Storage'
import { $StorageRepository } from './StorageRepository'

describe('Repository', () => {
  describe.each([
    [
      'InMemoryRepository',
      () =>
        pipe(
          $Layer,
          Layer.and(Layer.fromManaged(HasRepository)($InMemoryRepository)),
          Layer.using(Layer.fromValue(HasLogger)($NilLogger)),
          Layer.main,
        ),
    ],
    [
      'StorageRepository',
      (seed: number) =>
        pipe(
          $Layer,
          Layer.and(
            Layer.fromManaged(HasRepository)(
              $StorageRepository(resolve(tmpdir(), `repository.${seed}`)),
            ),
          ),
          Layer.using(Layer.fromValue(HasLogger)($NilLogger)),
          Layer.using(
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

    test('finding a nonexistent entity', async () => {
      await expect(
        pipe(
          $Repository.find({ _: { type: 'foo', id: 'bar' } }),
          Effect.provideSomeLayer(layer(seed)),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound.build('foo', 'bar'))
    })
    test('inserting an entity', async () => {
      await expect(
        pipe(
          $Repository.insert({ _: { type: 'foo', id: 'bar' } }),
          Effect.provideSomeLayer(layer(seed)),
          Effect.runPromise,
        ),
      ).resolves.toBeUndefined()
    })
    test('finding an entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Repository.insert({ _: { type: 'foo', id: 'bar' } }))

            return yield* _($Repository.find({ _: { type: 'foo', id: 'bar' } }))
          }),
          Effect.provideSomeLayer(layer(seed)),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({ _: { type: 'foo', id: 'bar' } })
    })
    test('replacing an entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Repository.insert({ _: { type: 'foo', id: 'bar' } }))

            return yield* _(
              $Repository.insert({ _: { type: 'foo', id: 'bar' } }),
            )
          }),
          Effect.provideSomeLayer(layer(seed)),
          Effect.runPromise,
        ),
      ).resolves.toBeUndefined()
    })
    test('updating a nonexistent entity', async () => {
      await expect(
        pipe(
          $Repository.update({ _: { type: 'foo', id: 'bar' } }),
          Effect.provideSomeLayer(layer(seed)),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound.build('foo', 'bar'))
    })
    test('updating an entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _(
              $Repository.insert({ _: { type: 'foo', id: 'bar' }, bar: 42 }),
            )
            yield* _(
              $Repository.update({
                _: { type: 'foo', id: 'bar' },
                mad: 'max',
              } as Entity),
            )

            return yield* _($Repository.find({ _: { type: 'foo', id: 'bar' } }))
          }),
          Effect.provideSomeLayer(layer(seed)),
          Effect.runPromise,
        ),
      ).resolves.toMatchObject({
        _: { type: 'foo', id: 'bar' },
        bar: 42,
        mad: 'max',
      })
    })
    test('deleting a nonexistent entity', async () => {
      await expect(
        pipe(
          $Repository.delete({ _: { type: 'foo', id: 'bar' } }),
          Effect.provideSomeLayer(layer(seed)),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound.build('foo', 'bar'))
    })
    test('deleting an entity', async () => {
      await expect(
        pipe(
          gen(function* (_) {
            yield* _($Repository.insert({ _: { type: 'foo', id: 'bar' } }))
            yield* _($Repository.delete({ _: { type: 'foo', id: 'bar' } }))

            return yield* _($Repository.find({ _: { type: 'foo', id: 'bar' } }))
          }),
          Effect.provideSomeLayer(layer(seed)),
          Effect.runPromise,
        ),
      ).rejects.toThrow(EntityNotFound.build('foo', 'bar'))
    })
  })
})
