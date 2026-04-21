'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Button } from './Button'

export function ThemeToggle() {
  const { settings, updateSettings } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        Theme
      </Button>
      {showMenu && (
        <div className="absolute right-0 mt-2 bg-bg border border-border-base rounded-sm shadow-lg z-10 min-w-[120px]">
          <button
            onClick={() => { updateSettings({ theme: 'dark' }); setShowMenu(false) }}
            className={`w-full text-left px-4 py-2 text-sm ${settings.theme === 'dark' ? 'text-brand' : 'text-text-primary hover:bg-bg-deep'}`}
          >
            Dark
          </button>
          <button
            onClick={() => { updateSettings({ theme: 'light' }); setShowMenu(false) }}
            className={`w-full text-left px-4 py-2 text-sm ${settings.theme === 'light' ? 'text-brand' : 'text-text-primary hover:bg-bg-deep'}`}
          >
            Light
          </button>
        </div>
      )}
    </div>
  )
}