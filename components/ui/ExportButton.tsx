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
    
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h]
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`
        return String(val ?? '')
      }).join(','))
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
      <Button onClick={() => setShowMenu(!showMenu)}>Export</Button>
      {showMenu && (
        <div className="absolute right-0 mt-2 bg-bg border border-border-base rounded-sm shadow-lg z-10 min-w-[150px]">
          <button
            onClick={() => exportCSV(contacts.map(c => ({ name: c.name, email: c.email, phone: c.phone, status: c.status })), 'contacts')}
            className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-deep text-sm"
          >
            Export Contacts
          </button>
          <button
            onClick={() => exportCSV(deals.map(d => ({ title: d.title, value: d.value, stage: d.stage })), 'deals')}
            className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-deep text-sm"
          >
            Export Deals
          </button>
          <button
            onClick={() => exportCSV(tasks.map(t => ({ title: t.title, description: t.description, status: t.status, due_date: t.due_date })), 'tasks')}
            className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-deep text-sm"
          >
            Export Tasks
          </button>
        </div>
      )}
    </div>
  )
}