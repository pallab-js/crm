'use client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Calendar, User, Building2, Briefcase, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskDetailModalProps {
  task: any
  onClose: () => void
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
  getContactName: (id?: string) => string
  getDealTitle: (id?: string) => string
  getCompanyName: (id?: string) => string
}

export function TaskDetailModal({ task, onClose, onUpdate, onDelete, getContactName, getDealTitle, getCompanyName }: TaskDetailModalProps) {
  const statusColors: Record<string, string> = {
    todo: 'text-text-muted',
    in_progress: 'text-[hsl(53,92%,50%)]',
    done: 'text-brand',
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg border border-border-base rounded-xl p-8 max-w-lg w-full shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary text-xl"
        >
          ×
        </button>
        
        <div className="mb-6">
          <Badge className={cn("mb-4", statusColors[task.status])}>
            {task.status.replace('_', ' ')}
          </Badge>
          <h2 className={cn("text-2xl font-bold text-text-primary", task.status === 'done' && "line-through")}>
            {task.title}
          </h2>
        </div>

        <div className="space-y-6">
          {task.description && (
            <div>
              <p className="text-[10px] uppercase text-text-muted tracking-wider font-bold mb-2">Description</p>
              <p className="text-text-secondary text-sm bg-bg-deep p-4 rounded-lg border border-border-subtle leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase text-text-muted tracking-wider font-bold mb-1">Timeline</p>
                <div className="flex items-center gap-2 text-sm text-text-primary">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                </div>
              </div>
              {task.recurring && (
                <div>
                  <p className="text-[10px] uppercase text-text-muted tracking-wider font-bold mb-1">Recurrence</p>
                  <div className="flex items-center gap-2 text-sm text-brand font-medium">
                    <Clock className="w-4 h-4" />
                    {task.recurring}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {task.contact_id && (
                <div>
                  <p className="text-[10px] uppercase text-text-muted tracking-wider font-bold mb-1">Related Contact</p>
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <User className="w-4 h-4 text-text-muted" />
                    {getContactName(task.contact_id)}
                  </div>
                </div>
              )}
              {task.deal_id && (
                <div>
                  <p className="text-[10px] uppercase text-text-muted tracking-wider font-bold mb-1">Related Deal</p>
                  <div className="flex items-center gap-2 text-sm text-text-primary font-medium">
                    <Briefcase className="w-4 h-4 text-text-muted" />
                    {getDealTitle(task.deal_id)}
                  </div>
                </div>
              )}
              {task.company_id && (
                <div>
                  <p className="text-[10px] uppercase text-text-muted tracking-wider font-bold mb-1">Company</p>
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <Building2 className="w-4 h-4 text-text-muted" />
                    {getCompanyName(task.company_id)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border-subtle flex gap-3">
          <Button 
            onClick={() => {
              onUpdate(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
              onClose()
            }}
            className="flex-1"
          >
            {task.status === 'done' ? 'Re-open Task' : 'Mark as Done'}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onDelete(task.id)}
            className="text-[hsl(348,75%,58%)] hover:bg-[hsl(348,75%,58%)]/10"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
