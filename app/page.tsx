'use client'
import { useEffect, useCallback, useState, lazy, Suspense, useRef, useMemo } from 'react'
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification'
import { useAppStore } from '@/store/dashboard'
import { StatCard } from '@/components/dashboard/StatCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Nav } from '@/components/ui/Nav'
import { Sidebar, SidebarItem } from '@/components/ui/Sidebar'
import { QuickAddFAB } from '@/components/ui/QuickAddFAB'
import { Button } from '@/components/ui/Button'
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks'
import { PipelineSummary } from '@/components/dashboard/PipelineSummary'
import { DashboardCharts } from '@/components/dashboard/DashboardCharts'
import { SalesProgress } from '@/components/dashboard/SalesProgress'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { AlertCircle, ArrowUpRight, ArrowDownRight, Clock, Zap, Command } from 'lucide-react'
import { cn } from '@/lib/utils'

const ContactsPage = lazy(() => import('@/components/pages/ContactsPage').then(m => ({ default: m.ContactsPage })))
const CompaniesPage = lazy(() => import('@/components/pages/CompaniesPage').then(m => ({ default: m.CompaniesPage })))
const DealsPage = lazy(() => import('@/components/pages/DealsPage').then(m => ({ default: m.DealsPage })))
const TasksPage = lazy(() => import('@/components/pages/TasksPage').then(m => ({ default: m.TasksPage })))
const CalendarPage = lazy(() => import('@/components/pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const AnalyticsPage = lazy(() => import('@/components/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))

function DashboardView() {
  const { contacts, deals, tasks, dashboard, setCurrentView } = useAppStore()

  const activeDealCount = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length
  const doneTaskCount = tasks.filter(t => t.status === 'done').length
  const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0)
  
  // Calculate Deltas (Simplified: mock logic for now as we don't have historical snapshots yet)
  const stats = [
    { label: 'Pipeline Value', value: `$${totalPipelineValue.toLocaleString()}`, delta: 12.5 },
    { label: 'Active Deals', value: String(activeDealCount), delta: 5.2 },
    { label: 'Contacts', value: String(contacts.length), delta: 8.1 },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const focusItems = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const overdue = tasks.filter(t => t.due_date < today && t.status !== 'done').slice(0, 2)
    const stagnantDeals = deals.filter(d => d.stage === 'lead' && new Date(d.created_at) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)).slice(0, 2)
    
    return [
      ...overdue.map(t => ({ id: t.id, type: 'task', title: `Overdue: ${t.title}`, urgency: 'high' })),
      ...stagnantDeals.map(d => ({ id: d.id, type: 'deal', title: `Stagnant Lead: ${d.title}`, urgency: 'medium' }))
    ]
  }, [tasks, deals])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-[40px] lg:text-[56px] leading-[0.95] font-normal text-text-primary tracking-tighter">
            {greeting}, <span className="text-brand font-medium">Operator</span>
          </h1>
          <p className="text-text-secondary mt-3 max-w-xl text-lg leading-relaxed">
            Your command center is online. {focusItems.length > 0 ? `You have ${focusItems.length} items requiring immediate attention.` : 'Everything is on track.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setCurrentView('tasks')} variant="ghost" className="border border-border-base bg-bg-deep/30">View Schedule</Button>
          <Button onClick={() => setCurrentView('analytics')} className="shadow-lg shadow-brand/20">Market Intel</Button>
        </div>
      </section>

      {focusItems.length > 0 && (
        <section className="bg-[hsl(348,75%,58%)]/5 border border-[hsl(348,75%,58%)]/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[hsl(348,75%,58%)]/10 flex items-center justify-center text-[hsl(348,75%,58%)] shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 flex flex-wrap gap-3">
            {focusItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setCurrentView(item.type + 's')}
                className="flex items-center gap-2 px-3 py-1.5 bg-bg border border-border-base rounded-full text-xs font-medium text-text-primary hover:border-brand transition-colors"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  item.urgency === 'high' ? "bg-[hsl(348,75%,58%)]" : "bg-[hsl(53,92%,50%)]"
                )} />
                {item.title}
              </button>
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-[hsl(348,75%,58%)] opacity-60">Focus Zone</span>
        </section>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="group relative">
            <StatCard {...s} />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {s.delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-brand" /> : <ArrowDownRight className="w-3.5 h-3.5 text-text-muted" />}
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SalesProgress />
          <DashboardCharts />
          <PipelineSummary />
        </div>
        <div className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <UpcomingTasks />
            <ActivityFeed items={dashboard.recent} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const notifiedTasksRef = useRef<Set<string>>(new Set())
  const { currentView, setCurrentView, load, error, loading, tasks } = useAppStore()
  const [showHelp, setShowHelp] = useState(false)

  const checkReminders = useCallback(async () => {
    let permission = await isPermissionGranted()
    if (!permission) {
      const permissionResponse = await requestPermission()
      permission = permissionResponse === 'granted'
    }

    if (permission) {
      const today = new Date().toISOString().split('T')[0]
      const dueToday = tasks.filter(t => t.due_date === today && t.status !== 'done')
      
      for (const task of dueToday) {
        if (!notifiedTasksRef.current.has(task.id)) {
          sendNotification({
            title: 'Task Due Today',
            body: task.title,
          })
          notifiedTasksRef.current.add(task.id)
        }
      }
    }
  }, [tasks])

  useEffect(() => {
    const timer = setInterval(checkReminders, 60000)
    checkReminders()
    return () => clearInterval(timer)
  }, [checkReminders])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    
    if (e.key === '1' && !e.metaKey) setCurrentView('dashboard')
    else if (e.key === '2' && !e.metaKey) setCurrentView('contacts')
    else if (e.key === '3' && !e.metaKey) setCurrentView('companies')
    else if (e.key === '4' && !e.metaKey) setCurrentView('deals')
    else if (e.key === '5' && !e.metaKey) setCurrentView('tasks')
    else if (e.key === '6' && !e.metaKey) setCurrentView('calendar')
    else if (e.key === '7' && !e.metaKey) setCurrentView('analytics')
    else if (e.key === '?' || e.key === '/') setShowHelp(h => !h)
  }, [setCurrentView])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    document.title = `OpenCRM - ${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`
  }, [currentView])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (loading) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-brand animate-pulse" />
          <div className="text-text-muted text-[10px] font-mono uppercase tracking-[2px]">Syncing Core…</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg flex">
      <CommandPalette />
      <Sidebar>
        <div className="mb-10">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Zap className="w-5 h-5 text-bg-deep fill-current" />
            </div>
            <span className="text-text-primary text-lg font-bold tracking-tight">OpenCRM</span>
          </div>
        </div>
        <nav className="space-y-1">
          <SidebarItem 
            href="#" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard <span className="text-text-muted text-[10px] ml-auto opacity-50 font-mono">1</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'contacts'} 
            onClick={() => setCurrentView('contacts')}
          >
            Contacts <span className="text-text-muted text-[10px] ml-auto opacity-50 font-mono">2</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'companies'} 
            onClick={() => setCurrentView('companies')}
          >
            Companies <span className="text-text-muted text-[10px] ml-auto opacity-50 font-mono">3</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'deals'} 
            onClick={() => setCurrentView('deals')}
          >
            Deals <span className="text-text-muted text-[10px] ml-auto opacity-50 font-mono">4</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'tasks'} 
            onClick={() => setCurrentView('tasks')}
          >
            Tasks <span className="text-text-muted text-[10px] ml-auto opacity-50 font-mono">5</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'calendar'} 
            onClick={() => setCurrentView('calendar')}
          >
            Calendar <span className="text-text-muted text-[10px] ml-auto opacity-50 font-mono">6</span>
          </SidebarItem>
          <SidebarItem 
            href="#" 
            active={currentView === 'analytics'} 
            onClick={() => setCurrentView('analytics')}
          >
            Analytics <span className="text-text-muted text-[10px] ml-auto opacity-50 font-mono">7</span>
          </SidebarItem>
        </nav>
        <div className="absolute bottom-6 left-6 text-text-muted text-[10px] font-mono leading-relaxed opacity-40">
          ⌘K SEARCH<br />
          1–7 NAVIGATE<br />
          ? HELP
        </div>
      </Sidebar>
      <div className="flex-1 flex flex-col min-w-0">
        <Nav />
        <div className="flex-1 px-6 py-6 max-w-7xl w-full mx-auto overflow-y-auto custom-scrollbar">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="text-text-muted text-[12px] font-mono uppercase tracking-[1.2px]">Initialising…</div>
            </div>
          }>
            {(() => {
              switch (currentView) {
                case 'contacts': return <ContactsPage />
                case 'companies': return <CompaniesPage />
                case 'deals': return <DealsPage />
                case 'tasks': return <TasksPage />
                case 'calendar': return <CalendarPage />
                case 'analytics': return <AnalyticsPage />
                default: return <DashboardView />
              }
            })()}
          </Suspense>
        </div>
        <QuickAddFAB />
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110]"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-bg border border-border-base rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <Command className="w-6 h-6" />
              </div>
              <h2 className="text-text-primary text-2xl font-bold tracking-tight">Shortcuts</h2>
            </div>
            <div className="space-y-4">
              {[
                ['⌘ K', 'Command Palette'], ['1–7', 'Quick Navigate'],
                ['?', 'This Help'], ['ESC', 'Close Modal'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between group">
                  <span className="text-text-muted text-sm group-hover:text-text-primary transition-colors">{label}</span>
                  <kbd className="font-mono text-[10px] uppercase tracking-wider text-text-primary bg-bg-deep border border-border-base rounded px-2 py-1 shadow-sm">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}