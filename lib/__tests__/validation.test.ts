import { describe, it, expect } from 'vitest'
import {
  sanitize,
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidNumber,
  validateContact,
  validateDeal,
  validateCompany,
} from '../validation'

describe('sanitize', () => {
  it('trims whitespace', () => {
    expect(sanitize('  hello  ')).toBe('hello')
    expect(sanitize('\t\ntest\t\n')).toBe('test')
  })
})

describe('isValidEmail', () => {
  it('validates correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.org')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('@domain.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('isValidPhone', () => {
  it('validates correct phone numbers', () => {
    expect(isValidPhone('+1-555-123-4567')).toBe(true)
    expect(isValidPhone('5551234567')).toBe(true)
    expect(isValidPhone('(555) 123-4567')).toBe(true)
  })

  it('accepts empty phone (optional field)', () => {
    expect(isValidPhone('')).toBe(true)
  })

  it('rejects invalid phones', () => {
    expect(isValidPhone('123')).toBe(false)
    expect(isValidPhone('abc')).toBe(false)
  })
})

describe('isValidName', () => {
  it('accepts valid names', () => {
    expect(isValidName('John')).toBe(true)
    expect(isValidName('A')).toBe(true)
  })

  it('rejects empty names', () => {
    expect(isValidName('')).toBe(false)
    expect(isValidName('   ')).toBe(false)
  })
})

describe('isValidNumber', () => {
  it('accepts valid non-negative numbers', () => {
    expect(isValidNumber(0)).toBe(true)
    expect(isValidNumber(100)).toBe(true)
  })

  it('rejects invalid values', () => {
    expect(isValidNumber(NaN)).toBe(false)
    expect(isValidNumber(-1)).toBe(false)
    expect(isValidNumber('100')).toBe(false)
  })
})

describe('validateContact', () => {
  it('passes valid contact', () => {
    expect(validateContact({ name: 'John', email: 'john@example.com' })).toEqual([])
  })

  it('returns errors for invalid data', () => {
    const errors = validateContact({ name: '', email: 'bad' })
    expect(errors).toContainEqual({ field: 'name', message: 'Name is required' })
    expect(errors).toContainEqual({ field: 'email', message: 'Invalid email format' })
  })
})

describe('validateDeal', () => {
  it('passes valid deal', () => {
    expect(validateDeal({ title: 'Big Sale', value: 1000 })).toEqual([])
  })

  it('returns errors for invalid deal', () => {
    const errors = validateDeal({ title: '', value: -5 })
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('validateCompany', () => {
  it('passes valid company', () => {
    expect(validateCompany({ name: 'Acme Corp' })).toEqual([])
    expect(validateCompany({ name: 'Acme Corp', domain: 'acme.com' })).toEqual([])
  })

  it('returns errors for invalid domain', () => {
    const errors = validateCompany({ name: 'Acme', domain: 'bad' })
    expect(errors).toContainEqual({ field: 'domain', message: 'Invalid domain format' })
  })
})