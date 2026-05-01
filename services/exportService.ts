import { Contact, Deal, Task } from '@/lib/ipc'

const escapeCSV = (val: unknown): string => {
  const s = String(val ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

export const toCSV = (data: Record<string, unknown>[]): string => {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  return [
    headers.join(','),
    ...data.map(row => headers.map(h => escapeCSV(row[h])).join(',')),
  ].join('\n')
}

export const exportContacts = (contacts: Contact[]): string =>
  toCSV(contacts.map(c => ({
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    tags: c.tags.join(';'),
    created_at: c.created_at,
  })))

export const exportDeals = (deals: Deal[]): string =>
  toCSV(deals.map(d => ({
    title: d.title,
    value: d.value,
    stage: d.stage,
    probability: d.probability,
    created_at: d.created_at,
  })))

export const exportTasks = (tasks: Task[]): string =>
  toCSV(tasks.map(t => ({
    title: t.title,
    description: t.description,
    status: t.status,
    due_date: t.due_date,
    recurring: t.recurring ?? '',
  })))

export const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
