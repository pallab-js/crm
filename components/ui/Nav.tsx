'use client'
import { memo } from 'react'
import { useContactsStore } from '@/store/contactsStore'
import { useDealsStore } from '@/store/dealsStore'
import { useTasksStore } from '@/store/tasksStore'
import { ExportButton } from './ExportButton'
import { ThemeToggle } from './ThemeToggle'
import { ImportButton } from './ImportButton'

export const Nav = memo(function Nav() {
  const contactCount = useContactsStore(s => s.contacts.length)
  const dealCount = useDealsStore(s => s.deals.length)
  const taskCount = useTasksStore(s => s.tasks.length)
  const totalItems = contactCount + dealCount + taskCount

  return (
    <nav className="sticky top-0 z-50 bg-bg border-b border-border-subtle px-6 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-text-muted text-[12px] font-mono uppercase tracking-[1.2px]" />
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
})
