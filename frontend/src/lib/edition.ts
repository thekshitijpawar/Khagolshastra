/**
 * Convert positive integer to Roman Numeral
 */
export function toRomanNumeral(num: number): string {
  if (num <= 0) return 'I'
  const romanMap: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let result = ''
  let n = Math.floor(num)
  for (const [val, roman] of romanMap) {
    while (n >= val) {
      result += roman
      n -= val
    }
  }
  return result || 'I'
}

/**
 * Returns the current daily edition in Roman numerals.
 * Inception Date: August 15, 2026 -> Edition No. I.
 * Increments by I each subsequent calendar day.
 */
export function getDailyEditionRoman(now: Date = new Date()): string {
  // Use UTC calendar dates to avoid time-zone boundary shifts
  const startUtc = Date.UTC(2026, 7, 15) // August is month 7 (0-indexed)
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())

  const diffDays = Math.floor((nowUtc - startUtc) / (1000 * 60 * 60 * 24))
  const editionNumber = Math.max(1, diffDays + 1)

  return toRomanNumeral(editionNumber)
}
