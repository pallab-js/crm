'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function CalendarPage() {
  const { tasks } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getTasksForDay = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    return tasks.filter(t => t.due_date === dateStr)
  }

  const today = new Date().toISOString().split('T')[0]

  const days = []
  for (let i = 0; i < startPadding; i++) {
    days.push(<div key={`pad-${i}`} className="min-h-[80px] bg-bg-deep/30 border border-border-subtle" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0]
    const dayTasks = getTasksForDay(day)
    const isToday = dateStr === today
    days.push(
      <div key={day} className={`min-h-[80px] border border-border-subtle p-1 ${isToday ? 'bg-brand/10' : 'bg-bg'}`}>
        <div className={`text-xs font-medium mb-1 ${isToday ? 'text-brand' : 'text-text-muted'}`}>{day}</div>
        <div className="space-y-1">
          {dayTasks.slice(0, 3).map(task => (
            <div
              key={task.id}
              className={`text-[10px] px-1 py-0.5 rounded truncate ${
                task.status === 'done' ? 'bg-brand/20 text-brand line-through' :
                task.status === 'in_progress' ? 'bg-yellow-400/20 text-yellow-400' :
                'bg-text-muted/20 text-text-muted'
              }`}
            >
              {task.title}
            </div>
          ))}
          {dayTasks.length > 3 && (
            <div className="text-[10px] text-text-muted">+{dayTasks.length - 3} more</div>
          )}
        </div>
      </div>
    )
  }

  const todoCount = tasks.filter(t => !t.due_date || t.status === 'todo').length
  const overdueCount = tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length
  const upcomingCount = tasks.filter(t => t.due_date && t.due_date >= today && t.due_date <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Calendar</h1>
          <p className="text-text-secondary mt-2">View tasks by due date</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-text-muted text-sm">No Due Date</p>
          <p className="text-[36px] text-text-primary">{todoCount}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Overdue</p>
          <p className="text-[36px] text-red-400">{overdueCount}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Due This Week</p>
          <p className="text-[36px] text-brand">{upcomingCount}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={prevMonth}>← Prev</Button>
          <h2 className="text-text-primary font-medium text-lg">{monthName}</h2>
          <Button variant="ghost" onClick={nextMonth}>Next →</Button>
        </div>
        
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-text-muted text-sm py-2 border-b border-border-subtle">
              {d}
            </div>
          ))}
          {days}
        </div>
      </Card>
    </div>
  )
}