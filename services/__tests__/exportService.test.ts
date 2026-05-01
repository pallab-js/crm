import { describe, it, expect } from 'vitest'
import { toCSV, exportContacts, exportDeals, exportTasks } from '../exportService'
import { Contact, Deal, Task } from '@/lib/ipc'

const makeContact = (): Contact => ({
  id: '1', name: 'Alice', email: 'alice@example.com', phone: '555-0001',
  status: 'lead', tags: ['VIP', 'Hot lead'],
  created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
})

const makeDeal = (): Deal => ({
  id: '1', title: 'Big Sale', value: 5000, stage: 'proposal', probability: 50,
  contact_id: 'c1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
})

const makeTask = (): Task => ({
  id: '1', title: 'Follow up', description: 'Call client', status: 'todo',
  due_date: '2024-02-01', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
})

describe('toCSV', () => {
  it('returns empty string for empty array', () => {
    expect(toCSV([])).toBe('')
  })

  it('generates header row', () => {
    const csv = toCSV([{ name: 'Alice', email: 'alice@example.com' }])
    expect(csv.split('\n')[0]).toBe('name,email')
  })

  it('escapes values containing commas', () => {
    const csv = toCSV([{ name: 'Smith, John', email: 'j@example.com' }])
    expect(csv).toContain('"Smith, John"')
  })

  it('escapes values containing double quotes', () => {
    const csv = toCSV([{ name: 'Say "Hello"', email: 'j@example.com' }])
    expect(csv).toContain('"Say ""Hello"""')
  })
})

describe('exportContacts', () => {
  it('includes name, email, status, tags', () => {
    const csv = exportContacts([makeContact()])
    expect(csv).toContain('Alice')
    expect(csv).toContain('alice@example.com')
    expect(csv).toContain('lead')
    expect(csv).toContain('VIP;Hot lead')
  })
})

describe('exportDeals', () => {
  it('includes title, value, stage, probability', () => {
    const csv = exportDeals([makeDeal()])
    expect(csv).toContain('Big Sale')
    expect(csv).toContain('5000')
    expect(csv).toContain('proposal')
    expect(csv).toContain('50')
  })
})

describe('exportTasks', () => {
  it('includes title, status, due_date', () => {
    const csv = exportTasks([makeTask()])
    expect(csv).toContain('Follow up')
    expect(csv).toContain('todo')
    expect(csv).toContain('2024-02-01')
  })
})
