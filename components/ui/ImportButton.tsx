'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Button } from './Button'
import { parseCSV, buildContacts, buildDeals, buildTasks } from '@/services/importService'

export function ImportButton() {
  const { batchAdd } = useAppStore()
  const [importing, setImporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [result, setResult] = useState<{ count: number; type: string } | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'contacts' | 'deals' | 'tasks') => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const rows = parseCSV(await file.text())
    let count = 0
    if (type === 'contacts') { const r = buildContacts(rows); count = r.length; await batchAdd('contacts', r) }
    else if (type === 'deals') { const r = buildDeals(rows); count = r.length; await batchAdd('deals', r) }
    else { const r = buildTasks(rows); count = r.length; await batchAdd('tasks', r) }
    setImporting(false)
    setShowMenu(false)
    setResult({ count, type })
    setTimeout(() => setResult(null), 4000)
    e.target.value = ''
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
    </div>
  )
}
