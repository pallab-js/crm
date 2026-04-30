'use client'
import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TaskDetailModal } from '@/components/dashboard/TaskDetailModal'
import { DealDetailModal } from '@/components/dashboard/DealDetailModal'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Briefcase, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CalendarPage() {
  const { tasks, deals, contacts, companies, addTask, updateTask, deleteTask, updateDeal } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hideCompleted, setHideCompleted] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [showTaskForm, setShowTaskForm] = useState<{ day: number } | null>(null)
  const [taskTitle, setTaskTitle] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getItemsForDay = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    const dayTasks = tasks.filter(t => t.due_date === dateStr && (!hideCompleted || t.status !== 'done'))
    const dayDeals = deals.filter(d => d.expected_close_date === dateStr)
    return { tasks: dayTasks, deals: dayDeals }
  }

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showTaskForm || !taskTitle) return
    const dateStr = new Date(year, month, showTaskForm.day).toISOString().split('T')[0]
    const now = new Date().toISOString()
    await addTask({
      id: crypto.randomUUID(),
      title: taskTitle,
      description: '',
      status: 'todo',
      due_date: dateStr,
      created_at: now,
      updated_at: now,
    })
    setTaskTitle('')
    setShowTaskForm(null)
  }

  const getContactName = (id?: string) => contacts.find(c => c.id === id)?.name || ''
  const getDealTitle = (id?: string) => deals.find(d => d.id === id)?.title || ''
  const getCompanyName = (id?: string) => companies.find(c => c.id === id)?.name || ''

  const today = new Date().toISOString().split('T')[0]

  const calendarDays = useMemo(() => {
    const days = []
    for (let i = 0; i < startPadding; i++) {
      days.push(<div key={`pad-${i}`} className="min-h-[120px] bg-bg-deep/10 border border-border-subtle/30" />)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0]
      const { tasks: dayTasks, deals: dayDeals } = getItemsForDay(day)
      const isToday = dateStr === today
      
      days.push(
        <div 
          key={day} 
          className={cn(
            "min-h-[120px] border border-border-subtle p-2 transition-colors relative group",
            isToday ? "bg-brand/5" : "bg-bg hover:bg-bg-deep/30"
          )}
          onClick={() => setShowTaskForm({ day })}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={cn(
              "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full",
              isToday ? "bg-brand text-bg" : "text-text-muted"
            )}>
              {day}
            </span>
            <button 
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-bg-deep rounded text-text-muted transition-all"
              onClick={(e) => { e.stopPropagation(); setShowTaskForm({ day }) }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1">
            {dayDeals.map(deal => (
              <div
                key={deal.id}
                onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal) }}
                className="text-[9px] px-1.5 py-0.5 rounded-sm bg-brand text-bg font-bold truncate flex items-center gap-1 cursor-pointer hover:brightness-110 shadow-sm"
              >
                <Briefcase className="w-2.5 h-2.5" />
                {deal.title}
              </div>
            ))}
            {dayTasks.map(task => (
              <div
                key={task.id}
                onClick={(e) => { e.stopPropagation(); setSelectedTask(task) }}
                className={cn(
                  "text-[9px] px-1.5 py-0.5 rounded-sm truncate flex items-center gap-1 cursor-pointer transition-all",
                  task.status === 'done' 
                    ? "bg-bg-deep text-text-muted border border-border-subtle line-through" 
                    : task.status === 'in_progress' 
                      ? "bg-[hsl(53,92%,50%)]/20 text-[hsl(53,92%,50%)] border border-[hsl(53,92%,50%)]/30"
                      : "bg-text-secondary/10 text-text-secondary border border-border-subtle"
                )}
              >
                {task.status === 'done' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <CalendarIcon className="w-2.5 h-2.5" />}
                {task.title}
              </div>
            ))}
          </div>

          {showTaskForm?.day === day && (
            <div 
              className="absolute inset-0 z-10 bg-bg p-2 shadow-2xl border border-brand/50 rounded-lg animate-in fade-in zoom-in duration-150"
              onClick={e => e.stopPropagation()}
            >
              <form onSubmit={handleQuickAddTask} className="h-full flex flex-col gap-2">
                <textarea
                  autoFocus
                  placeholder="Quick task..."
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && setShowTaskForm(null)}
                  className="flex-1 bg-bg-deep border border-border-base rounded p-1 text-[10px] text-text-primary focus:outline-none resize-none"
                />
                <div className="flex gap-1">
                  <button type="submit" className="flex-1 bg-brand text-bg text-[10px] font-bold py-1 rounded">Add</button>
                  <button type="button" onClick={() => setShowTaskForm(null)} className="flex-1 bg-bg-deep text-text-muted text-[10px] py-1 rounded">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )
    }
    return days
  }, [year, month, tasks, deals, hideCompleted, showTaskForm, taskTitle])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Calendar</h1>
          <p className="text-text-secondary mt-2">Manage your schedule and deal milestones</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer hover:text-text-primary transition-colors">
            <input 
              type="checkbox" 
              checked={hideCompleted} 
              onChange={e => setHideCompleted(e.target.checked)}
              className="w-4 h-4 accent-brand rounded border-border-base"
            />
            Hide Completed
          </label>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-bg-deep/50 border-none p-4">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Due Today</span>
          </div>
          <p className="text-[32px] text-text-primary font-bold">
            {tasks.filter(t => t.due_date === today && t.status !== 'done').length}
          </p>
        </Card>
        <Card className="bg-bg-deep/50 border-none p-4">
          <div className="flex items-center gap-2 text-[hsl(348,75%,58%)] mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Overdue</span>
          </div>
          <p className="text-[32px] text-[hsl(348,75%,58%)] font-bold">
            {tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length}
          </p>
        </Card>
        <Card className="bg-bg-deep/50 border-none p-4">
          <div className="flex items-center gap-2 text-brand mb-1">
            <Briefcase className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Deals This Month</span>
          </div>
          <p className="text-[32px] text-brand font-bold">
            {deals.filter(d => d.expected_close_date?.startsWith(`${year}-${(month+1).toString().padStart(2, '0')}`)).length}
          </p>
        </Card>
        <Card className="bg-bg-deep/50 border-none p-4">
          <div className="flex items-center gap-2 text-text-secondary mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Done Today</span>
          </div>
          <p className="text-[32px] text-text-primary font-bold">
            {tasks.filter(t => t.updated_at.startsWith(today) && t.status === 'done').length}
          </p>
        </Card>
      </div>

      <Card className="p-0 border-none shadow-2xl bg-bg-deep/20 overflow-hidden">
        <div className="flex items-center justify-between p-6 bg-bg border-b border-border-base">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-text-primary">{monthName}</h2>
            <div className="flex bg-bg-deep rounded-lg p-1">
              <button onClick={prevMonth} className="p-1.5 hover:bg-bg rounded-md transition-all text-text-muted hover:text-text-primary"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={nextMonth} className="p-1.5 hover:bg-bg rounded-md transition-all text-text-muted hover:text-text-primary"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          <Button variant="primary" onClick={() => setCurrentDate(new Date())} className="text-xs py-1.5 h-auto">Go to Today</Button>
        </div>
        
        <div className="grid grid-cols-7">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] uppercase tracking-widest font-bold text-text-muted py-3 bg-bg border-b border-border-base">
              {d}
            </div>
          ))}
          {calendarDays}
        </div>
      </Card>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          getContactName={getContactName}
          getDealTitle={getDealTitle}
          getCompanyName={getCompanyName}
        />
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={updateDeal}
          addTask={addTask}
          contacts={contacts}
          companies={companies}
        />
      )}
    </div>
  )
}