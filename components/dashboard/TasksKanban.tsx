'use client'
import { useAppStore } from '@/store/dashboard'
import { TASK_STATUSES } from '@/lib/constants'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, User, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TasksKanbanProps {
  onTaskClick?: (task: any) => void
}

export function TasksKanban({ onTaskClick }: TasksKanbanProps) {
  const { tasks, contacts, updateTask } = useAppStore()

  const getContactName = (id?: string) => contacts.find(c => c.id === id)?.name || ''

  const moveTask = async (id: string, currentStatus: string, direction: 'next' | 'prev') => {
    const statuses = [...TASK_STATUSES]
    const currentIndex = statuses.indexOf(currentStatus as any)
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (nextIndex >= 0 && nextIndex < statuses.length) {
      await updateTask(id, { status: statuses[nextIndex] })
    }
  }

  const isOverdue = (date?: string) => {
    if (!date) return false
    return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 h-[calc(100vh-280px)] min-h-[500px]">
      {TASK_STATUSES.map((status) => (
        <div key={status} className="flex-shrink-0 w-80 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary capitalize">{status.replace('_', ' ')}</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-bg-deep border border-border-base rounded-full text-text-muted">
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
          </div>

          <div className="flex-1 bg-bg-deep/50 border border-border-subtle rounded-xl p-2 space-y-3 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {tasks.filter(t => t.status === status).map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className={cn(
                      "p-3 hover:border-brand-border transition-colors group cursor-pointer relative",
                      task.status === 'done' && "opacity-60"
                    )}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={cn(
                        "text-sm font-medium text-text-primary transition-colors line-clamp-2",
                        task.status === 'done' && "line-through"
                      )}>
                        {task.title}
                      </h4>
                      {isOverdue(task.due_date) && task.status !== 'done' && (
                        <AlertCircle className="w-3.5 h-3.5 text-[hsl(348,75%,58%)] flex-shrink-0" />
                      )}
                    </div>

                    <div className="space-y-2">
                      {task.description && (
                        <p className="text-xs text-text-muted line-clamp-1">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 pt-1">
                        {task.due_date && (
                          <div className={cn(
                            "flex items-center gap-1 text-[10px]",
                            isOverdue(task.due_date) && task.status !== 'done' ? "text-[hsl(348,75%,58%)] font-medium" : "text-text-muted"
                          )}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                        {task.contact_id && (
                          <div className="flex items-center gap-1 text-[10px] text-text-muted">
                            <User className="w-3 h-3" />
                            <span className="line-clamp-1">{getContactName(task.contact_id)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-3 border-t border-border-subtle/30">
                      {TASK_STATUSES.indexOf(status as any) > 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveTask(task.id, status, 'prev') }}
                          className="p-1 hover:bg-bg border border-border-base rounded text-text-muted hover:text-text-primary transition-all"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      )}
                      {TASK_STATUSES.indexOf(status as any) < TASK_STATUSES.length - 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveTask(task.id, status, 'next') }}
                          className="p-1 hover:bg-brand/10 border border-border-base hover:border-brand/30 rounded text-text-muted hover:text-brand transition-all"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {tasks.filter(t => t.status === status).length === 0 && (
              <div className="h-24 border border-dashed border-border-base rounded-xl flex items-center justify-center">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium">Empty</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
