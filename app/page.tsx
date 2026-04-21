'use client'
import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/dashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Nav } from '@/components/ui/Nav'
import { Sidebar, SidebarItem } from '@/components/ui/Sidebar'
import { QuickAddFAB } from '@/components/ui/QuickAddFAB'
import { ContactsPage } from '@/components/pages/ContactsPage'
import { CompaniesPage } from '@/components/pages/CompaniesPage'
import { DealsPage } from '@/components/pages/DealsPage'
import { TasksPage } from '@/components/pages/TasksPage'
import { CalendarPage } from '@/components/pages/CalendarPage'
import { AnalyticsPage } from '@/components/pages/AnalyticsPage'

function DashboardView() {
  const { contacts, deals, tasks, dashboard } = useAppStore()

  const stats = [
    { label: 'Total Contacts', value: String(contacts.length), delta: contacts.length > 0 ? 100 : 0 },
    { label: 'Active Deals', value: String(deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length), delta: deals.length > 0 ? 50 : 0 },
    { label: 'Tasks Done', value: String(tasks.filter(t => t.status === 'done').length), delta: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0 },
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
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      </section>

      <section>
        <ActivityFeed items={dashboard.recent} />
      </section>
    </div>
  )
}

export default function HomePage() {
  const { currentView, setCurrentView, load } = useAppStore()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    
    if (e.key === '1') setCurrentView('dashboard')
    else if (e.key === '2') setCurrentView('contacts')
    else if (e.key === '3') setCurrentView('companies')
    else if (e.key === '4') setCurrentView('deals')
    else if (e.key === '5') setCurrentView('tasks')
    else if (e.key === '6') setCurrentView('calendar')
    else if (e.key === '7') setCurrentView('analytics')
  }, [setCurrentView])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    document.title = `OpenCRM - ${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`
  }, [currentView])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const renderView = () => {
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
          Press 1-7 to navigate
        </div>
      </Sidebar>
      <div className="flex-1">
        <Nav />
        <div className="px-6 py-12 max-w-7xl mx-auto">
          {renderView()}
        </div>
        <QuickAddFAB />
      </div>
    </main>
  )
}