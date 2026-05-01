import { Contact, Deal, Task } from '@/lib/ipc'

export const parseCSV = (text: string): Record<string, string>[] => {
  const rows: string[][] = []
  let cell = ''
  let inQuotes = false
  let row: string[] = []

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]
    if (ch === '"') {
      if (inQuotes && next === '"') { cell += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      row.push(cell.trim()); cell = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (row.length > 0 || cell !== '') { row.push(cell.trim()); rows.push(row); row = []; cell = '' }
      if (ch === '\r' && next === '\n') i++
    } else {
      cell += ch
    }
  }
  if (row.length > 0 || cell !== '') { row.push(cell.trim()); rows.push(row) }
  if (rows.length < 2) return []

  const headers = rows[0].map(h => h.toLowerCase())
  return rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])))
}

export const buildContacts = (rows: Record<string, string>[]): Contact[] => {
  const now = new Date().toISOString()
  return rows
    .filter(r => r.name && r.email)
    .map(r => ({
      id: crypto.randomUUID(),
      name: r.name,
      email: r.email,
      phone: r.phone ?? '',
      status: r.status || 'lead',
      tags: r.tags ? r.tags.split(';').filter(Boolean) : [],
      created_at: now,
      updated_at: now,
    }))
}

export const buildDeals = (rows: Record<string, string>[]): Deal[] => {
  const now = new Date().toISOString()
  return rows
    .filter(r => r.title && r.value)
    .map(r => ({
      id: crypto.randomUUID(),
      title: r.title,
      value: parseFloat(r.value) || 0,
      stage: r.stage || 'lead',
      probability: parseInt(r.probability) || 10,
      contact_id: r.contact_id ?? '',
      company_id: r.company_id || undefined,
      created_at: now,
      updated_at: now,
    }))
}

export const buildTasks = (rows: Record<string, string>[]): Task[] => {
  const now = new Date().toISOString()
  return rows
    .filter(r => r.title)
    .map(r => ({
      id: crypto.randomUUID(),
      title: r.title,
      description: r.description ?? '',
      status: r.status || 'todo',
      due_date: r.due_date ?? '',
      recurring: r.recurring || undefined,
      created_at: now,
      updated_at: now,
    }))
}
