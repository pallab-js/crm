'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Button } from './Button'

interface ImportResult {
  success: boolean
  message: string
}

export function ImportButton() {
  const { addContact, addDeal, addTask } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)
  const [importing, setImporting] = useState(false)

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, i) => {
        row[h] = values[i] || ''
      })
      return row
    })
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'contacts' | 'deals' | 'tasks') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImporting(true)
    const text = await file.text()
    const data = parseCSV(text)
    const now = new Date().toISOString()
    
    let count = 0
    for (const row of data) {
      if (type === 'contacts' && row.name && row.email) {
        await addContact({
          id: crypto.randomUUID(),
          name: row.name,
          email: row.email,
          phone: row.phone || '',
          status: row.status || 'lead',
          tags: row.tags ? row.tags.split(';') : [],
          created_at: now,
          updated_at: now,
        })
        count++
      } else if (type === 'deals' && row.title && row.value) {
        await addDeal({
          id: crypto.randomUUID(),
          title: row.title,
          value: parseFloat(row.value) || 0,
          stage: row.stage || 'lead',
          probability: parseInt(row.probability) || 10,
          contact_id: row.contact_id || '',
          created_at: now,
          updated_at: now,
        })
        count++
      } else if (type === 'tasks' && row.title) {
        await addTask({
          id: crypto.randomUUID(),
          title: row.title,
          description: row.description || '',
          status: row.status || 'todo',
          due_date: row.due_date || '',
          recurring: row.recurring || undefined,
          created_at: now,
          updated_at: now,
        })
        count++
      }
    }
    
    setImporting(false)
    setShowMenu(false)
    alert(`Imported ${count} ${type}`)
    e.target.value = ''
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setShowMenu(!showMenu)} disabled={importing}>
        {importing ? 'Importing...' : 'Import'}
      </Button>
      {showMenu && (
        <div className="absolute right-0 mt-2 bg-bg border border-border-base rounded-sm shadow-lg z-10 min-w-[180px]">
          <label className="block w-full text-left px-4 py-2 text-text-primary hover:bg-bg-deep text-sm cursor-pointer">
            Import Contacts CSV
            <input type="file" accept=".csv" className="hidden" onChange={e => handleFile(e, 'contacts')} />
          </label>
          <label className="block w-full text-left px-4 py-2 text-text-primary hover:bg-bg-deep text-sm cursor-pointer">
            Import Deals CSV
            <input type="file" accept=".csv" className="hidden" onChange={e => handleFile(e, 'deals')} />
          </label>
          <label className="block w-full text-left px-4 py-2 text-text-primary hover:bg-bg-deep text-sm cursor-pointer">
            Import Tasks CSV
            <input type="file" accept=".csv" className="hidden" onChange={e => handleFile(e, 'tasks')} />
          </label>
        </div>
      )}
    </div>
  )
}