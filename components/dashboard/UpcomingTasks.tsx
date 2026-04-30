'use client'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { CheckCircle2, Circle, Calendar, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UpcomingTasks() {
  const { tasks, updateTask, setCurrentView } = useAppStore()

  const today = new Date().toISOString().split('T')[0]
  const upcoming = tasks
    .filter(t => t.status !== 'done' && t.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5)

  if (upcoming.length === 0) {
    return (
      <Card className="h-full flex flex-col justify-center items-center text-center p-8">
        <div className="w-12 h-12 bg-bg-deep border border-border-base rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-text-muted" />
        </div>
        <h3 className="text-text-primary font-medium mb-1">All caught up!</h3>
        <p className="text-text-muted text-sm">No upcoming tasks for now.</p>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] text-text-primary font-medium">Upcoming Tasks</h3>
        <button 
          onClick={() => setCurrentView('tasks')}
          className="text-text-muted hover:text-brand transition-colors flex items-center gap-1 text-xs"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2.5 flex-1">
        {upcoming.map((task) => (
          <div key={task.id} className="group flex items-start gap-2">
            <button 
              onClick={() => updateTask(task.id, { status: 'done' })}
              className="mt-0.5 text-text-muted hover:text-brand transition-colors"
            >
              <Circle className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate group-hover:text-brand transition-colors cursor-pointer" onClick={() => setCurrentView('tasks')}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3 text-text-muted" />
                <span className={cn(
                  "text-[10px] uppercase tracking-wider font-semibold",
                  task.due_date === today ? "text-[hsl(348,75%,58%)]" : "text-text-muted"
                )}>
                  {task.due_date === today ? 'Today' : task.due_date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
