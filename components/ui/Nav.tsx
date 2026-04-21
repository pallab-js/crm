'use client'
import { useAppStore } from '@/store/dashboard'
import { ExportButton } from './ExportButton'
import { ThemeToggle } from './ThemeToggle'
import { ImportButton } from './ImportButton'

export function Nav() {
  const { contacts, deals, tasks } = useAppStore()
  const totalItems = contacts.length + deals.length + tasks.length

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-border-subtle px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
              <span className="text-bg-deep text-sm font-bold">O</span>
            </div>
            <span className="text-text-primary text-[14px] font-medium">OpenCRM</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-text-muted text-xs">{totalItems} records</span>
          <ImportButton />
          <ThemeToggle />
          <ExportButton />
        </div>
      </div>
    </nav>
  )
}