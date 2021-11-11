import { Array, Effect, pipe } from '@effect-ts/core'
import * as Tuple from '@effect-ts/core/Collections/Immutable/Tuple'
import * as Layer from '@effect-ts/system/Layer'
import EventEmitter from 'events'
import fs from 'fs'
import { $AggregateId } from '../src/core/aggregates/Aggregate'
import { $Entity } from '../src/core/entities/Entity'
import { $StorageRepository } from '../src/core/entities/repositories/StorageRepository'
import { HasRepository } from '../src/core/entities/Repository'
import { $Logger, HasLogger } from '../src/core/Logger'
import { $Console } from '../src/core/loggers/Console'
import {
  $ServiceBus,
  HasServiceBus,
} from '../src/core/messages/commands/ServiceBus'
import { $InMemoryServiceBus } from '../src/core/messages/commands/serviceBuses/InMemoryServiceBus'
import {
  $EventStore,
  HasEventStore,
} from '../src/core/messages/events/EventStore'
import { $StorageEventStore } from '../src/core/messages/events/eventStores/StorageEventStore'
import { $CorrelationId } from '../src/core/messages/Message'
import { HasStorage } from '../src/core/Storage'
import { $Fs } from '../src/core/storages/Fs'
import { $Uuid, HasUuid } from '../src/core/Uuid'
import { $Rfc4122 } from '../src/core/uuids/Rfc4122'
import { $SeatBooking } from '../src/domain/sagas/SeatBooking'
import { $BookSeats } from '../src/domain/screening/commands/BookSeats'
import { $ConfirmBooking } from '../src/domain/screening/commands/ConfirmBooking'
import { $CreateScreening } from '../src/domain/screening/commands/CreateScreening'
import { $ExpireReservation } from '../src/domain/screening/commands/ExpireReservation'
import { $FreeSeats } from '../src/domain/screening/commands/FreeSeats'
import { $ReserveSeats } from '../src/domain/screening/commands/ReserveSeats'
import { $Film, $FilmId } from '../src/domain/screening/entities/Film'
import { $Screen, $ScreenId } from '../src/domain/screening/entities/Screen'
import { $ScreeningCreated } from '../src/domain/screening/events/ScreeningCreated'
import { $SeatsReserved } from '../src/domain/screening/events/SeatsReserved'
import { $RefundPayment } from '../src/domain/screening/payment/commands/RefundPayment'
import { $StartPayment } from '../src/domain/screening/payment/commands/StartPayment'

pipe(
  [
    $ScreeningCreated.updateScreeningProjection,
    $SeatsReserved.expireReservation,
    $SeatsReserved.updateScreeningProjection,
    $SeatBooking.freeSeats,
    $SeatBooking.startPayment,
    $SeatBooking.confirmBookingOrRefundPayment,
  ] as any,
  Array.sequence(Effect.Applicative),
  Effect.tap(Array.mapEffectPar($EventStore.subscribe as any)),
  Effect.map(
    () =>
      [
        $CreateScreening.handler,
        $ReserveSeats.handler,
        $BookSeats.handler,
        $StartPayment.handler,
        $ExpireReservation.handler,
        $FreeSeats.handler,
        $BookSeats.handler,
        $RefundPayment.handler,
        $ConfirmBooking.handler,
      ] as any,
  ),
  Effect.chain(Array.sequence(Effect.Applicative)),
  Effect.tap(Array.mapEffectPar($ServiceBus.registerHandler as any)),
  Effect.tap(() => $EventStore.run),
  Effect.bindAllPar(() => ({
    energiaScreenId: pipe($Uuid.v4, Effect.map($ScreenId)),
    dunePartOneFilmId: pipe($Uuid.v4, Effect.map($FilmId)),
    dunePartTwoFilmId: pipe($Uuid.v4, Effect.map($FilmId)),
    dunePartOneScreeningId: pipe($Uuid.v4, Effect.map($AggregateId)),
    dunePartTwoScreeningId: pipe($Uuid.v4, Effect.map($AggregateId)),
    correlationId: pipe($Uuid.v4, Effect.map($CorrelationId)),
  })),
  Effect.tap(({ energiaScreenId, dunePartOneFilmId, dunePartTwoFilmId }) =>
    pipe(
      Effect.tuplePar(
        $Screen()(
          { name: 'Energia', seats: { rows: 16, columns: 40 } },
          { id: energiaScreenId },
        ),
        $Film()({ name: 'Dune: Part One' }, { id: dunePartOneFilmId }),
        $Film()({ name: 'Dune: Part Two' }, { id: dunePartTwoFilmId }),
      ),
      Effect.map(Tuple.toNative),
      Effect.tap(Array.mapEffectPar($Entity.create)),
    ),
  ),
  Effect.chain(
    ({
      energiaScreenId,
      dunePartOneFilmId,
      dunePartTwoFilmId,
      dunePartOneScreeningId,
      dunePartTwoScreeningId,
      correlationId,
    }) =>
      pipe(
        Effect.do,
        Effect.chain(() =>
          $CreateScreening()({
            aggregateId: dunePartOneScreeningId,
            filmId: dunePartOneFilmId,
            screenId: energiaScreenId,
            date: new Date('2021-09-23T19:00:00Z'),
          })(),
        ),
        Effect.tap($ServiceBus.dispatch),
        Effect.tap(() => Effect.sleep(1000)),
        Effect.chain(() =>
          $CreateScreening()({
            aggregateId: dunePartTwoScreeningId,
            filmId: dunePartTwoFilmId,
            screenId: energiaScreenId,
            date: new Date('2023-10-20T19:00:00Z'),
          })(),
        ),
        Effect.tap($ServiceBus.dispatch),
        Effect.tap(() => Effect.sleep(1000)),
        Effect.chain(() =>
          $ReserveSeats()(
            {
              aggregateId: dunePartOneScreeningId,
              seats: [
                { row: 12, column: 18 },
                { row: 12, column: 19 },
                { row: 12, column: 20 },
                { row: 12, column: 21 },
                { row: 12, column: 22 },
              ],
            },
            { correlationId },
          )(),
        ),
        Effect.tap($ServiceBus.dispatch),
        Effect.tap(() => Effect.sleep(1)),
        Effect.chain(() =>
          $ReserveSeats()({
            aggregateId: dunePartTwoScreeningId,
            seats: [
              { row: 12, column: 20 },
              { row: 12, column: 21 },
            ],
          })(),
        ),
        Effect.tap($ServiceBus.dispatch),
        Effect.tap(() => Effect.sleep(1000)),
        Effect.chain(() =>
          $BookSeats()(
            { aggregateId: dunePartOneScreeningId, provider: 'PayPal' },
            { correlationId },
          )(),
        ),
        Effect.tap($ServiceBus.dispatch),
      ),
  ),
  Effect.provideSomeLayer(
    Layer.all(
      // Layer.fromManaged(HasEventStore)(
      //   $InMemoryEventStore(() => new EventEmitter()),
      // ),
      Layer.fromManaged(HasEventStore)(
        $StorageEventStore('var/eventstore', () => new EventEmitter()),
      ),
      // Layer.fromManaged(HasRepository)($InMemoryRepository),
      Layer.fromManaged(HasRepository)($StorageRepository('var/repository')),
      Layer.fromManaged(HasServiceBus)(
        $InMemoryServiceBus(() => new EventEmitter()),
      ),
    ),
  ),
  Effect.provideSomeLayer(
    Layer.all(
      Layer.pure(HasLogger)(pipe($Console(true), $Logger.level('debug'))),
      Layer.pure(HasStorage)($Fs(fs)),
      Layer.pure(HasUuid)($Rfc4122),
    ),
  ),
  Effect.run,
)
