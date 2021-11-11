import { Effect, pipe } from '@effect-ts/core'
import {
  $Aggregate,
  $AggregateId,
  Aggregate,
  AggregateRoot,
} from '../aggregates/Aggregate'
import { $Logger } from '../Logger'
import { CorrelationId } from '../messages/Message'

const CHANNEL = 'Saga'

export interface Saga<A extends string = string>
  extends AggregateRoot<`Saga.${A}`> {}

const load =
  <A extends Saga>(aggregate: Aggregate<A>) =>
  (correlationId: CorrelationId) =>
    pipe(
      correlationId,
      $AggregateId,
      $Aggregate.load(aggregate),
      Effect.tapBoth(
        (error) =>
          $Logger.error('Saga not loaded', {
            sagaType: aggregate.type,
            error,
            correlationId,
            channel: CHANNEL,
          }),
        () =>
          $Logger.debug('Saga loaded', {
            sagaType: aggregate.type,
            correlationId,
            channel: CHANNEL,
          }),
      ),
    )

export const $Saga = { load }

// export function $Saga<A extends Saga>(type: A['_']['type']) {
//   return (
//       body: Omit<A, keyof Saga | keyof Branded.Brand<any>>,
//       header?: Partial<Omit<A['_'], 'type'>>,
//     ) =>
//     <B extends Command>(command?: B) =>
//       pipe(
//         header?.id
//           ? Effect.succeed(header.id)
//           : pipe($Uuid.v4, Effect.map($CorrelationId)),
//         Effect.chain((id) =>
//           $MutableEntity(type)(body, { ...header, id } as Partial<
//             Omit<A['_'], 'type'>
//           >),
//         ),
//         Effect.map((saga) =>
//           command
//             ? {
//                 ...saga,
//                 _: {
//                   ...saga._,
//                   id: command._.correlationId,
//                   dateCreated: command._.date,
//                 },
//               }
//             : saga,
//         ),
//       )
// }

// $Saga.start = <A extends Saga>(saga: A) =>
//   pipe(
//     saga,
//     $Entity.create,
//     Effect.tapBoth(
//       (error) =>
//         $Logger.error('Saga not started', {
//           sagaType: saga._.type,
//           error,
//           correlationId: saga._.id,
//           channel: CHANNEL,
//         }),
//       () =>
//         $Logger.info('Saga started', {
//           sagaType: saga._.type,
//           correlationId: saga._.id,
//           channel: CHANNEL,
//         }),
//     ),
//   )

// $Saga.pause = <A extends Saga>(saga: A) =>
//   pipe(
//     saga,
//     $Entity.update,
//     Effect.tapBoth(
//       (error) =>
//         $Logger.error('Saga not paused', {
//           sagaType: saga._.type,
//           error,
//           correlationId: saga._.id,
//           channel: CHANNEL,
//         }),
//       () =>
//         $Logger.debug('Saga paused', {
//           sagaType: saga._.type,
//           correlationId: saga._.id,
//           channel: CHANNEL,
//         }),
//     ),
//   )

// $Saga.resume =
//   <A extends Saga>(type: A['_']['type']) =>
//   (id: A['_']['id']) =>
//     pipe(
//       id,
//       $Entity.read(type),
//       Effect.tapBoth(
//         (error) =>
//           $Logger.error('Saga not resumed', {
//             sagaType: type,
//             error,
//             correlationId: id,
//             channel: CHANNEL,
//           }),
//         () =>
//           $Logger.debug('Saga resumed', {
//             sagaType: type,
//             correlationId: id,
//             channel: CHANNEL,
//           }),
//       ),
//     )

// $Saga.stop = <A extends Saga>(saga: A) =>
//   pipe(
//     saga,
//     $Entity.delete,
//     Effect.tapBoth(
//       (error) =>
//         $Logger.error('Saga not stopped', {
//           sagaType: saga._.type,
//           error,
//           correlationId: saga._.id,
//           channel: CHANNEL,
//         }),
//       () =>
//         $Logger.debug('Saga stopped', {
//           sagaType: saga._.type,
//           correlationId: saga._.id,
//           channel: CHANNEL,
//         }),
//     ),
//   )
