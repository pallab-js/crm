'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Button } from './Button'
import { parseCSV, buildContacts, buildDeals, buildTasks } from '@/services/importService'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function ImportButton() {
  const { batchAdd } = useAppStore()
  const [importing, setImporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [result, setResult] = useState<{ count: number; type: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'contacts' | 'deals' | 'tasks') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`)
      setTimeout(() => setError(null), 5000)
      return
    }

    setImporting(true)
    setError(null)
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      let count = 0
      if (type === 'contacts') { const r = buildContacts(rows); count = r.length; await batchAdd('contacts', r) }
      else if (type === 'deals') { const r = buildDeals(rows); count = r.length; await batchAdd('deals', r) }
      else { const r = buildTasks(rows); count = r.length; await batchAdd('tasks', r) }
      setResult({ count, type })
      setTimeout(() => setResult(null), 4000)
    } catch (err) {
      setError('Failed to import file. Please check the format.')
      console.error('[OpenCRM] Import error occurred')
    } finally {
      setImporting(false)
      setShowMenu(false)
      e.target.value = ''
    }
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setShowMenu(!showMenu)} disabled={importing}>
        {importing ? 'Importing...' : 'Import'}
      </Button>
      {showMenu && (
        <div className="absolute right-0 mt-2 bg-bg border border-border-base rounded-[6px] z-10 min-w-[180px]">
          {(['contacts', 'deals', 'tasks'] as const).map(type => (
            <label key={type} className="block w-full text-left px-4 py-2 text-text-primary hover:bg-bg-deep text-sm cursor-pointer capitalize">
              Import {type} CSV
              <input type="file" accept=".csv" className="hidden" onChange={e => handleFile(e, type)} />
            </label>
          ))}
        </div>
      )}
      {result && (
        <div className="absolute right-0 mt-2 bg-bg border border-border-prominent rounded-[6px] px-4 py-2 text-sm text-brand z-20">
          ✓ Imported {result.count} {result.type}
        </div>
      )}
      {error && (
        <div className="absolute right-0 mt-2 bg-[hsl(348,75%,58%)]/10 border border-[hsl(348,75%,58%)] rounded-[6px] px-4 py-2 text-sm text-[hsl(348,75%,58%)] z-20">
          {error}
        </div>
      )}
    </div>
  )
}
