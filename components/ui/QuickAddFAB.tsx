'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from './Card'
import { Button } from './Button'

export function QuickAddFAB() {
  const { setCurrentView } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showMenu && (
        <div className="absolute bottom-14 right-0 space-y-2">
          <button
            onClick={() => { setCurrentView('contacts'); setShowMenu(false) }}
            className="flex items-center gap-2 bg-bg border border-border-base px-4 py-2 rounded-[6px] text-text-primary hover:bg-bg-deep transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-brand"></span>
            Add Contact
          </button>
          <button
            onClick={() => { setCurrentView('companies'); setShowMenu(false) }}
            className="flex items-center gap-2 bg-bg border border-border-base px-4 py-2 rounded-[6px] text-text-primary hover:bg-bg-deep transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[hsl(251,63.2%,63.2%)]"></span>
            Add Company
          </button>
          <button
            onClick={() => { setCurrentView('deals'); setShowMenu(false) }}
            className="flex items-center gap-2 bg-bg border border-border-base px-4 py-2 rounded-[6px] text-text-primary hover:bg-bg-deep transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[hsl(53,92%,50%)]"></span>
            Add Deal
          </button>
          <button
            onClick={() => { setCurrentView('tasks'); setShowMenu(false) }}
            className="flex items-center gap-2 bg-bg border border-border-base px-4 py-2 rounded-[6px] text-text-primary hover:bg-bg-deep transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-text-muted"></span>
            Add Task
          </button>
        </div>
      )}
      <button
        aria-label={showMenu ? "Close quick add" : "Quick add"}
        onClick={() => setShowMenu(!showMenu)}
        className="w-14 h-14 rounded-full bg-brand text-bg-deep flex items-center justify-center text-2xl font-bold hover:scale-110 transition-transform"
      >
        {showMenu ? '×' : '+'}
      </button>
    </div>
  )
}