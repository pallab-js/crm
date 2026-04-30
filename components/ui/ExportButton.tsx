'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function ExportButton() {
  const { contacts, deals, tasks } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return
    
    const escapeCSV = (val: unknown): string => {
      const s = String(val ?? '')
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }

    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => escapeCSV(row[h])).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setShowMenu(false)
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setShowMenu(!showMenu)}>Export</Button>
      {showMenu && (
        <div className="absolute right-0 mt-2 bg-bg-deep border border-border-prominent rounded-xl shadow-2xl z-10 min-w-[200px] overflow-hidden py-1">
          <button
            onClick={() => exportCSV(contacts.map(c => ({ 
              name: c.name, 
              email: c.email, 
              phone: c.phone, 
              status: c.status,
              tags: c.tags.join(';'),
              created_at: c.created_at
            })), 'contacts')}
            className="w-full text-left px-4 py-2 text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors text-sm"
          >
            Export Contacts
          </button>
          <button
            onClick={() => exportCSV(deals.map(d => ({ 
              title: d.title, 
              value: d.value, 
              stage: d.stage,
              probability: d.probability,
              created_at: d.created_at
            })), 'deals')}
            className="w-full text-left px-4 py-2 text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors text-sm"
          >
            Export Deals
          </button>
          <button
            onClick={() => exportCSV(tasks.map(t => ({ 
              title: t.title, 
              description: t.description, 
              status: t.status, 
              due_date: t.due_date,
              recurring: t.recurring || ''
            })), 'tasks')}
            className="w-full text-left px-4 py-2 text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors text-sm"
          >
            Export Tasks
          </button>
        </div>
      )}
    </div>
  )
}