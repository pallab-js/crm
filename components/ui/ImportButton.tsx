'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Button } from './Button'

interface ImportResult {
  success: boolean
  message: string
}

export function ImportButton() {
  const { addContact, addDeal, addTask, batchAdd } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ count: number; type: string } | null>(null)

  const parseCSV = (text: string): Record<string, string>[] => {
    const rows: string[][] = []
    let currentCell = ''
    let inQuotes = false
    let currentRow: string[] = []

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim())
        currentCell = ''
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (currentRow.length > 0 || currentCell !== '') {
          currentRow.push(currentCell.trim())
          rows.push(currentRow)
          currentRow = []
          currentCell = ''
        }
        if (char === '\r' && nextChar === '\n') i++
      } else {
        currentCell += char
      }
    }

    if (currentRow.length > 0 || currentCell !== '') {
      currentRow.push(currentCell.trim())
      rows.push(currentRow)
    }

    if (rows.length < 2) return []

    const headers = rows[0].map(h => h.toLowerCase())
    return rows.slice(1).map(row => {
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => {
        obj[h] = row[i] || ''
      })
      return obj
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

    if (type === 'contacts') {
      const records = data
        .filter(row => row.name && row.email)
        .map(row => ({
          id: crypto.randomUUID(),
          name: row.name,
          email: row.email,
          phone: row.phone || '',
          status: (row.status as string) || 'lead',
          tags: row.tags ? row.tags.split(';') : [],
          created_at: now,
          updated_at: now,
        }))
      count = records.length
      await batchAdd('contacts', records)
    } else if (type === 'deals') {
      const records = data
        .filter(row => row.title && row.value)
        .map(row => ({
          id: crypto.randomUUID(),
          title: row.title,
          value: parseFloat(row.value) || 0,
          stage: row.stage || 'lead',
          probability: parseInt(row.probability) || 10,
          contact_id: row.contact_id || '',
          company_id: row.company_id || undefined,
          created_at: now,
          updated_at: now,
        }))
      count = records.length
      await batchAdd('deals', records)
    } else if (type === 'tasks') {
      const records = data
        .filter(row => row.title)
        .map(row => ({
          id: crypto.randomUUID(),
          title: row.title,
          description: row.description || '',
          status: row.status || 'todo',
          due_date: row.due_date || '',
          recurring: row.recurring || undefined,
          created_at: now,
          updated_at: now,
        }))
      count = records.length
      await batchAdd('tasks', records)
    }

    setImporting(false)
    setShowMenu(false)
    setImportResult({ count, type })
    setTimeout(() => setImportResult(null), 4000)
    e.target.value = ''
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setShowMenu(!showMenu)} disabled={importing}>
        {importing ? 'Importing...' : 'Import'}
      </Button>
      {showMenu && (
        <div className="absolute right-0 mt-2 bg-bg border border-border-base rounded-[6px] z-10 min-w-[180px]">
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
      {importResult && (
        <div className="absolute right-0 mt-2 bg-bg border border-border-prominent rounded-[6px] px-4 py-2 text-sm text-brand z-20">
          ✓ Imported {importResult.count} {importResult.type}
        </div>
      )}
    </div>
  )
}