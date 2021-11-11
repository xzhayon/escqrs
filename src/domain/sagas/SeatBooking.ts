import { Effect, Option, pipe } from '@effect-ts/core'
import { HasClock } from '@effect-ts/core/Effect/Clock'
import {
  $Aggregate,
  $AggregateId,
  AggregateId,
} from '../../core/aggregates/Aggregate'
import { HasRepository } from '../../core/entities/Repository'
import { $Error } from '../../core/Error'
import { $Logger, HasLogger } from '../../core/Logger'
import {
  $ServiceBus,
  HasServiceBus,
} from '../../core/messages/commands/ServiceBus'
import { $EventHandler } from '../../core/messages/events/EventHandler'
import { HasEventStore } from '../../core/messages/events/EventStore'
import { $Saga, Saga } from '../../core/sagas/Saga'
import { $Uuid, HasUuid } from '../../core/Uuid'
import { $ConfirmBooking } from '../screening/commands/ConfirmBooking'
import { $FreeSeats } from '../screening/commands/FreeSeats'
import { $Screening } from '../screening/entities/Screening'
import { ReservationExpired_v0 } from '../screening/events/ReservationExpired'
import { SeatBookingRequested_v0 } from '../screening/events/SeatBookingRequested'
import { SeatsBooked_v0 } from '../screening/events/SeatsBooked'
import { SeatsReserved_v0 } from '../screening/events/SeatsReserved'
import { $RefundPayment } from '../screening/payment/commands/RefundPayment'
import { $StartPayment } from '../screening/payment/commands/StartPayment'
import { $Payment } from '../screening/payment/entities/Payment'
import { PaymentAccepted_v0 } from '../screening/payment/events/PaymentAccepted'
import { PaymentRefunded_v0 } from '../screening/payment/events/PaymentRefunded'
import { PaymentStarted_v0 } from '../screening/payment/events/PaymentStarted'
import { State } from './State'

const CHANNEL = 'SeatBooking'

export interface SeatBooking extends Saga<'SeatBooking'> {
  readonly screeningId: Option.Option<AggregateId>
  readonly paymentId: Option.Option<AggregateId>
  readonly paymentState: State
}

const aggregate = $Aggregate<
  SeatBooking,
  | SeatsReserved_v0
  | ReservationExpired_v0
  | PaymentStarted_v0
  | PaymentAccepted_v0
  | PaymentRefunded_v0
  | SeatsBooked_v0
>('Aggregate.Saga.SeatBooking', {
  'Event.SeatsReserved': ({ aggregateId }) =>
    Option.some({
      screeningId: Option.some(aggregateId),
      paymentId: Option.none,
      paymentState: 'Idle',
    }),
  'Event.ReservationExpired': (_, saga) =>
    pipe(
      saga,
      Option.map((_saga) => ({ ..._saga, paymentState: 'Canceled' })),
    ),
  'Event.PaymentStarted': (event, saga) =>
    pipe(
      saga,
      Option.map((_saga) => ({
        ..._saga,
        paymentId: Option.some(event.aggregateId),
        paymentState: 'Running',
      })),
    ),
  'Event.PaymentAccepted': (_, saga) =>
    pipe(
      saga,
      Option.map((_saga) => ({
        ..._saga,
        paymentState:
          'Running' === _saga.paymentState ? 'Done' : _saga.paymentState,
      })),
    ),
  'Event.PaymentRefunded': () => Option.none,
  'Event.SeatsBooked': () => Option.none,
})

export const $SeatBooking = {
  aggregate: aggregate,
  freeSeats: $EventHandler<ReservationExpired_v0>(
    'Event.ReservationExpired',
    'FreeSeats',
  )(
    Effect.accessServices({
      $clock: HasClock,
      $eventStore: HasEventStore,
      $logger: HasLogger,
      $repository: HasRepository,
      $serviceBus: HasServiceBus,
      $uuid: HasUuid,
    })(
      ({ $clock, $eventStore, $logger, $repository, $serviceBus, $uuid }) =>
        (event) =>
          pipe(
            event._.correlationId,
            $Saga.load(aggregate),
            Effect.tap((saga) =>
              'Done' !== saga.paymentState
                ? pipe(
                    saga.screeningId,
                    Effect.fromOption,
                    Effect.mapError(
                      $Error.fromUnknown(
                        Error(
                          `Cannot find ID for entity of type "${$Screening.aggregate.type}"`,
                        ),
                      ),
                    ),
                    Effect.chain((screeningId) =>
                      $FreeSeats()({ aggregateId: screeningId })(event),
                    ),
                    Effect.tap($ServiceBus.dispatch),
                    Effect.tap(() =>
                      $Logger.debug('Reservation expired', {
                        correlationId: saga._.id,
                        timeout: event.timeout,
                        channel: CHANNEL,
                      }),
                    ),
                    Effect.asUnit,
                  )
                : Effect.unit,
            ),
            Effect.provideService(HasClock)($clock),
            Effect.provideService(HasEventStore)($eventStore),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasRepository)($repository),
            Effect.provideService(HasServiceBus)($serviceBus),
            Effect.provideService(HasUuid)($uuid),
          ),
    ),
  ),
  startPayment: $EventHandler<SeatBookingRequested_v0>(
    'Event.SeatBookingRequested',
    'StartPayment',
  )(
    pipe(
      Effect.accessServices({
        $eventStore: HasEventStore,
        $logger: HasLogger,
        $serviceBus: HasServiceBus,
        $uuid: HasUuid,
      })(
        ({ $eventStore, $logger, $serviceBus, $uuid }) =>
          (event) =>
            pipe(
              event._.correlationId,
              $Saga.load(aggregate),
              Effect.chain(({ paymentState }) =>
                'Idle' === paymentState || 'Failed' === paymentState
                  ? pipe(
                      $Uuid.v4,
                      Effect.chain((aggregateId) =>
                        $StartPayment()({
                          aggregateId: $AggregateId(aggregateId),
                          seatCount: event.seatCount,
                          provider: event.provider,
                        })(event),
                      ),
                      Effect.tap($ServiceBus.dispatch),
                      Effect.asUnit,
                    )
                  : Effect.unit,
              ),
              Effect.provideService(HasEventStore)($eventStore),
              Effect.provideService(HasLogger)($logger),
              Effect.provideService(HasServiceBus)($serviceBus),
              Effect.provideService(HasUuid)($uuid),
            ),
      ),
    ),
  ),
  confirmBookingOrRefundPayment: $EventHandler<PaymentAccepted_v0>(
    'Event.PaymentAccepted',
    'ConfirmBookingOrRefundPayment',
  )(
    Effect.accessServices({
      $eventStore: HasEventStore,
      $logger: HasLogger,
      $repository: HasRepository,
      $serviceBus: HasServiceBus,
      $uuid: HasUuid,
    })(
      ({ $eventStore, $logger, $repository, $serviceBus, $uuid }) =>
        (event) =>
          pipe(
            event._.correlationId,
            $Saga.load(aggregate),
            Effect.tap((saga) =>
              'Done' === saga.paymentState
                ? pipe(
                    saga.screeningId,
                    Effect.fromOption,
                    Effect.mapError(
                      $Error.fromUnknown(
                        Error(
                          `Cannot find ID for entity of type "${$Screening.aggregate.type}"`,
                        ),
                      ),
                    ),
                    Effect.chain((screeningId) =>
                      $ConfirmBooking()({ aggregateId: screeningId })(event),
                    ),
                    Effect.tap($ServiceBus.dispatch),
                  )
                : pipe(
                    saga.paymentId,
                    Effect.fromOption,
                    Effect.mapError(
                      $Error.fromUnknown(
                        Error(
                          `Cannot find ID for entity of type "${$Payment.aggregate.type}"`,
                        ),
                      ),
                    ),
                    Effect.chain((paymentId) =>
                      $RefundPayment()({ aggregateId: paymentId })(event),
                    ),
                    Effect.tap($ServiceBus.dispatch),
                  ),
            ),
            Effect.provideService(HasEventStore)($eventStore),
            Effect.provideService(HasLogger)($logger),
            Effect.provideService(HasRepository)($repository),
            Effect.provideService(HasServiceBus)($serviceBus),
            Effect.provideService(HasUuid)($uuid),
          ),
    ),
  ),
}
