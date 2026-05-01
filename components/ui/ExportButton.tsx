'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Button } from '@/components/ui/Button'
import { exportContacts, exportDeals, exportTasks, downloadCSV } from '@/services/exportService'

export function ExportButton() {
  const { contacts, deals, tasks } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)

  const handle = (csv: string, name: string) => {
    downloadCSV(csv, name)
    setShowMenu(false)
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={() => setShowMenu(!showMenu)}>Export</Button>
      {showMenu && (
        <div className="absolute right-0 mt-2 bg-bg-deep border border-border-prominent rounded-xl shadow-2xl z-10 min-w-[200px] overflow-hidden py-1">
          <button onClick={() => handle(exportContacts(contacts), 'contacts')} className="w-full text-left px-4 py-2 text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors text-sm">Export Contacts</button>
          <button onClick={() => handle(exportDeals(deals), 'deals')} className="w-full text-left px-4 py-2 text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors text-sm">Export Deals</button>
          <button onClick={() => handle(exportTasks(tasks), 'tasks')} className="w-full text-left px-4 py-2 text-text-secondary hover:text-brand hover:bg-brand/10 transition-colors text-sm">Export Tasks</button>
        </div>
      )}
    </div>
  )
}
