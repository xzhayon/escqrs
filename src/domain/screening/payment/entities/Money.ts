import { Big } from 'big.js'

export interface Money {
  readonly currency: 'EUR' | 'USD'
  readonly amount: Big
}

export function $Money(currency: Money['currency']) {
  return (amount: number | Big): Money => ({ currency, amount: Big(amount) })
}
