import { describe, it, expect } from 'vitest'
import { formatDate, formatCurrency, DEAL_STAGES } from '../constants'

describe('formatDate', () => {
  it('returns Today for current date', () => {
    expect(formatDate(new Date().toISOString())).toBe('Today')
  })
  it('returns Yesterday for 1 day ago', () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    expect(formatDate(d.toISOString())).toBe('Yesterday')
  })
})

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234)).toBe('$1,234')
    expect(formatCurrency(0)).toBe('$0')
  })
})

describe('DEAL_STAGES', () => {
  it('contains closed_won and closed_lost', () => {
    expect(DEAL_STAGES).toContain('closed_won')
    expect(DEAL_STAGES).toContain('closed_lost')
  })
})