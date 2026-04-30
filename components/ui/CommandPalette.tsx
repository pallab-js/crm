'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Search, User, Building2, Briefcase, Calendar, CheckSquare, Zap, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { contacts, companies, deals, setCurrentView } = useAppStore()

  const results = useMemo(() => {
    if (!search) return []
    const s = search.toLowerCase()
    
    const matchedContacts = contacts
      .filter(c => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s))
      .slice(0, 3)
      .map(c => ({ id: c.id, type: 'contact', title: c.name, subtitle: c.email, icon: User }))

    const matchedCompanies = companies
      .filter(c => c.name.toLowerCase().includes(s))
      .slice(0, 3)
      .map(c => ({ id: c.id, type: 'company', title: c.name, subtitle: c.industry, icon: Building2 }))

    const matchedDeals = deals
      .filter(d => d.title.toLowerCase().includes(s))
      .slice(0, 3)
      .map(d => ({ id: d.id, type: 'deal', title: d.title, subtitle: `$${d.value.toLocaleString()}`, icon: Briefcase }))

    return [...matchedContacts, ...matchedCompanies, ...matchedDeals]
  }, [search, contacts, companies, deals])

  const actions = [
    { id: 'v-dashboard', type: 'action', title: 'Go to Dashboard', icon: Zap, cmd: () => setCurrentView('dashboard') },
    { id: 'v-contacts', type: 'action', title: 'View Contacts', icon: User, cmd: () => setCurrentView('contacts') },
    { id: 'v-deals', type: 'action', title: 'Manage Deals', icon: Briefcase, cmd: () => setCurrentView('deals') },
    { id: 'v-calendar', type: 'action', title: 'Open Calendar', icon: Calendar, cmd: () => setCurrentView('calendar') },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-[2px]"
      onClick={() => setIsOpen(false)}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="w-full max-w-2xl bg-bg border border-border-base rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-border-subtle bg-bg-deep/50">
          <Search className="w-5 h-5 text-text-muted mr-3" />
          <input 
            autoFocus
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 py-4 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-lg"
          />
          <kbd className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-text-muted border border-border-base rounded px-1.5 py-0.5">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
          {search ? (
            results.length > 0 ? (
              <div className="space-y-1">
                <p className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-text-muted">Search Results</p>
                {results.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setCurrentView(item.type + 's'); setIsOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-deep transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-bg border border-border-base flex items-center justify-center text-text-muted group-hover:text-brand transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.title}</p>
                      <p className="text-xs text-text-muted">{item.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-text-muted text-sm">No results found for "{search}"</p>
              </div>
            )
          ) : (
            <div className="space-y-1">
              <p className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-text-muted">Quick Actions</p>
              {actions.map(action => (
                <button
                  key={action.id}
                  onClick={() => { action.cmd(); setIsOpen(false) }}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-bg-deep transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-bg border border-border-base flex items-center justify-center text-text-muted group-hover:text-brand transition-colors">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{action.title}</span>
                  </div>
                  <Command className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-bg-deep/50 border-t border-border-subtle flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <kbd className="border border-border-base rounded px-1">↑↓</kbd> <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <kbd className="border border-border-base rounded px-1">↵</kbd> <span>Select</span>
            </div>
          </div>
          <span className="text-[10px] text-text-muted font-mono tracking-tighter">OpenCRM Core v2.4</span>
        </div>
      </motion.div>
    </div>
  )
}
