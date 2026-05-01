import { describe, it, expect } from 'vitest'
import { parseCSV, buildContacts, buildDeals, buildTasks } from '../importService'

describe('parseCSV', () => {
  it('returns empty array for header-only CSV', () => {
    expect(parseCSV('name,email')).toEqual([])
  })

  it('parses simple CSV into objects', () => {
    const rows = parseCSV('name,email\nAlice,alice@example.com')
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Alice')
    expect(rows[0].email).toBe('alice@example.com')
  })

  it('handles quoted fields with commas', () => {
    const rows = parseCSV('name,email\n"Smith, John",john@example.com')
    expect(rows[0].name).toBe('Smith, John')
  })

  it('handles CRLF line endings', () => {
    const rows = parseCSV('name,email\r\nAlice,alice@example.com')
    expect(rows).toHaveLength(1)
  })

  it('returns empty array for empty string', () => {
    expect(parseCSV('')).toEqual([])
  })
})

describe('buildContacts', () => {
  it('filters rows missing name or email', () => {
    const rows = [{ name: '', email: 'x@x.com' }, { name: 'Alice', email: 'alice@example.com' }]
    expect(buildContacts(rows)).toHaveLength(1)
  })

  it('splits tags by semicolon', () => {
    const rows = [{ name: 'Alice', email: 'alice@example.com', tags: 'VIP;Hot lead' }]
    const contacts = buildContacts(rows)
    expect(contacts[0].tags).toEqual(['VIP', 'Hot lead'])
  })

  it('assigns a uuid id', () => {
    const rows = [{ name: 'Alice', email: 'alice@example.com' }]
    const contacts = buildContacts(rows)
    expect(contacts[0].id).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe('buildDeals', () => {
  it('filters rows missing title or value', () => {
    const rows = [{ title: '', value: '1000' }, { title: 'Deal', value: '500' }]
    expect(buildDeals(rows)).toHaveLength(1)
  })

  it('parses value as float', () => {
    const rows = [{ title: 'Deal', value: '1234.56' }]
    expect(buildDeals(rows)[0].value).toBe(1234.56)
  })
})

describe('buildTasks', () => {
  it('filters rows missing title', () => {
    const rows = [{ title: '' }, { title: 'Task' }]
    expect(buildTasks(rows)).toHaveLength(1)
  })

  it('defaults status to todo', () => {
    const rows = [{ title: 'Task' }]
    expect(buildTasks(rows)[0].status).toBe('todo')
  })
})
