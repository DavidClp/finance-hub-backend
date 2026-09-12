/** Shift a date by N calendar months, clamping day when needed (e.g. Jan 31 + 1 month → Feb 28). */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  const day = result.getUTCDate()
  result.setUTCDate(1)
  result.setUTCMonth(result.getUTCMonth() + months)

  const daysInMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate()

  result.setUTCDate(Math.min(day, daysInMonth))
  return result
}

export function startOfCurrentUtcMonth(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export function resolvePaymentDate(
  date: Date,
  paymentMethod: string,
  creditCardNextMonth: boolean,
): Date {
  if (paymentMethod === 'credit' && creditCardNextMonth) {
    return addMonths(date, 1)
  }

  return date
}
