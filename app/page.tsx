'use client'
import { useEffect, useCallback, useState, lazy, Suspense } from 'react'
import { useAppStore } from '@/store/dashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Nav } from '@/components/ui/Nav'
import { Sidebar, SidebarItem } from '@/components/ui/Sidebar'
import { QuickAddFAB } from '@/components/ui/QuickAddFAB'
import { Button } from '@/components/ui/Button'

const ContactsPage = lazy(() => import('@/components/pages/ContactsPage').then(m => ({ default: m.ContactsPage })))
const CompaniesPage = lazy(() => import('@/components/pages/CompaniesPage').then(m => ({ default: m.CompaniesPage })))
const DealsPage = lazy(() => import('@/components/pages/DealsPage').then(m => ({ default: m.DealsPage })))
const TasksPage = lazy(() => import('@/components/pages/TasksPage').then(m => ({ default: m.TasksPage })))
const CalendarPage = lazy(() => import('@/components/pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const AnalyticsPage = lazy(() => import('@/components/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))

function DashboardView() {
  const { contacts, deals, tasks, dashboard } = useAppStore()

  const activeDealCount = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length
  const doneTaskCount = tasks.filter(t => t.status === 'done').length
  const taskCompletionRate = tasks.length > 0 ? Math.round((doneTaskCount / tasks.length) * 100) : 0

  const stats = [
    { label: 'Total Contacts', value: String(contacts.length), delta: undefined },
    { label: 'Active Deals', value: String(activeDealCount), delta: undefined },
    { label: 'Tasks Done', value: `${doneTaskCount}/${tasks.length}`, delta: taskCompletionRate },
  ]

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">
          Dashboard
        </h1>
        <p className="text-text-secondary mt-4 max-w-xl">
          Your CRM at a glance.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      <section>
        <ActivityFeed items={dashboard.recent} />
      </section>
    </div>
  )
}

export default function HomePage() {
  const { currentView, setCurrentView, load, error, loading } = useAppStore()
  const [showError, setShowError] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    
    if (e.key === 'Escape') {
      // Escape is handled via onKeyDown inside ContactsPage modal; no DOM removal needed here.
    }
    else if (e.key === '1' && !e.metaKey) setCurrentView('dashboard')
    else if (e.key === '2' && !e.metaKey) setCurrentView('contacts')
    else if (e.key === '3' && !e.metaKey) setCurrentView('companies')
    else if (e.key === '4' && !e.metaKey) setCurrentView('deals')
    else if (e.key === '5' && !e.metaKey) setCurrentView('tasks')
    else if (e.key === '6' && !e.metaKey) setCurrentView('calendar')
    else if (e.key === '7' && !e.metaKey) setCurrentView('analytics')
    else if (e.key === '?' || e.key === '/') setShowHelp(h => !h)
  }, [setCurrentView, showHelp])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (error) setShowError(true)
  }, [error])

  useEffect(() => {
    document.title = `OpenCRM - ${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`
  }, [currentView])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const renderView = () => {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-text-muted text-[12px] font-mono uppercase tracking-[1.2px]">Loading…</div>
        </div>
      }>
        {(() => {
          switch (currentView) {
            case 'contacts':
              return <ContactsPage />
            case 'companies':
              return <CompaniesPage />
            case 'deals':
              return <DealsPage />
            case 'tasks':
              return <TasksPage />
            case 'calendar':
              return <CalendarPage />
            case 'analytics':
              return <AnalyticsPage />
            default:
              return <DashboardView />
          }
        })()}
      </Suspense>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-bg flex">
        <aside className="w-64 bg-bg border-r border-border-subtle min-h-screen p-4 animate-pulse">
          <div className="h-8 bg-border-subtle rounded-[6px] mb-6" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-6 bg-border-subtle rounded-[6px] mb-2 opacity-50" style={{ width: `${70 + i * 3}%` }} />
          ))}
        </aside>
        <div className="flex-1 px-6 py-12 max-w-7xl mx-auto space-y-8">
          <div className="h-[72px] bg-border-subtle rounded-[6px] w-48 animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-bg border border-border-base rounded-[8px] p-6 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (showError && error) {
    return (
      <main className="min-h-screen bg-bg flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-[hsl(348,75%,58%)] text-lg mb-4">Failed to load data</p>
            <p className="text-text-muted mb-6">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={load}>Retry</Button>
              <Button variant="ghost" onClick={() => setShowError(false)}>Dismiss</Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg flex">
      <Sidebar>
        <div className="mb-6">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
              <span className="text-bg-deep text-sm font-bold">O</span>
            </div>
            <span className="text-text-primary text-[14px] font-medium">OpenCRM</span>
          </div>
        </div>
        <nav className="space-y-1">
          <SidebarItem 
            href="#" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard <span className="text-text-muted text-xs ml-2">1</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'contacts'} 
            onClick={() => setCurrentView('contacts')}
          >
            Contacts <span className="text-text-muted text-xs ml-2">2</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'companies'} 
            onClick={() => setCurrentView('companies')}
          >
            Companies <span className="text-text-muted text-xs ml-2">3</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'deals'} 
            onClick={() => setCurrentView('deals')}
          >
            Deals <span className="text-text-muted text-xs ml-2">4</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'tasks'} 
            onClick={() => setCurrentView('tasks')}
          >
            Tasks <span className="text-text-muted text-xs ml-2">5</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'calendar'} 
            onClick={() => setCurrentView('calendar')}
          >
            Calendar <span className="text-text-muted text-xs ml-2">6</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'analytics'} 
            onClick={() => setCurrentView('analytics')}
          >
            Analytics <span className="text-text-muted text-xs ml-2">7</span>
          </SidebarItem>
        </nav>
        <div className="absolute bottom-4 left-4 text-text-muted text-xs">
          Press 1–7 or ? for help
        </div>
      </Sidebar>
      <div className="flex-1">
        <Nav />
        <div className="px-6 py-12 max-w-7xl mx-auto">
          {renderView()}
        </div>
        <QuickAddFAB />
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-bg border border-border-base rounded-[8px] p-6 max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-text-primary text-[18px] mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2">
              {[
                ['1', 'Dashboard'], ['2', 'Contacts'], ['3', 'Companies'],
                ['4', 'Deals'], ['5', 'Tasks'], ['6', 'Calendar'], ['7', 'Analytics'],
                ['?', 'This help'], ['Esc', 'Close modal'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-text-muted text-[14px]">{label}</span>
                  <kbd className="font-mono text-[12px] uppercase tracking-[1.2px] text-text-muted border border-border-base rounded-[6px] px-2 py-0.5">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}