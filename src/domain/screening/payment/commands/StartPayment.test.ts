import { $AggregateId } from '../../../../core/aggregates/Aggregate'
import { Gwt } from '../../../../test/Gwt'
import { $Money } from '../entities/Money'
import { Provider } from '../entities/Provider'
import { $PaymentStarted } from '../events/PaymentStarted'
import { $StartPayment } from './StartPayment'

const aggregateId = $AggregateId('aggregateId')
const provider: Provider = 'PayPal'

describe('StartPayment', () => {
  describe('handler', () => {
    it('', async () => {
      jest.setTimeout(15000)

      const seatCount = 3

      return Gwt.test($StartPayment.handler)
        .when($StartPayment()({ aggregateId, provider, seatCount })())
        .then(
          $PaymentStarted()({
            aggregateId,
            provider,
            seatCount,
            sumPerSeat: $Money('EUR')(8.5),
          })(),
        )
        .run()
    })
  })
})
