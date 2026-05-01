import { memo } from 'react'
import { Task } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, User, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  todo: 'text-text-muted',
  in_progress: 'text-[hsl(53,92%,50%)]',
  done: 'text-brand',
}

const isOverdue = (date?: string) => !!date && new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))

interface Props {
  tasks: Task[]
  onSelect: (t: Task) => void
  onUpdate: (id: string, updates: Partial<Task>) => void
  onDelete: (id: string) => void
  getContactName: (id?: string) => string
  search: string
  filter: string
}

export const TaskTable = memo(function TaskTable({ tasks, onSelect, onUpdate, onDelete, getContactName, search, filter }: Props) {
  if (tasks.length === 0) {
    return (
      <Card className="py-12 border-dashed">
        <div className="text-center">
          <Clock className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
          <p className="text-text-muted">{search || filter !== 'all' ? 'No tasks found matching your criteria' : 'Clean slate! Add your first task to get started.'}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <Card key={task.id} className={cn('group cursor-pointer hover:border-brand-border transition-colors', task.status === 'done' && 'opacity-60')} onClick={() => onSelect(task)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative" onClick={e => e.stopPropagation()}>
                <input type="checkbox" checked={task.status === 'done'} onChange={e => onUpdate(task.id, { status: e.target.checked ? 'done' : 'todo' })} className="w-5 h-5 accent-brand cursor-pointer" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-text-primary font-medium ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</p>
                  {isOverdue(task.due_date) && task.status !== 'done' && <Badge className="bg-[hsl(348,75%,58%)]/10 text-[hsl(348,75%,58%)] border-none text-[8px] h-4">OVERDUE</Badge>}
                  {task.recurring && <span className="text-[10px] text-brand px-1.5 py-0.5 bg-brand/10 rounded">🔄 {task.recurring}</span>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {task.due_date && (
                    <span className={cn('text-xs flex items-center gap-1', isOverdue(task.due_date) && task.status !== 'done' ? 'text-[hsl(348,75%,58%)] font-semibold' : 'text-text-muted')}>
                      <Calendar className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {task.contact_id && <span className="text-xs text-text-muted flex items-center gap-1"><User className="w-3 h-3" />{getContactName(task.contact_id)}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
              <Badge className={cn('text-[10px]', STATUS_COLORS[task.status])}>{task.status.replace('_', ' ')}</Badge>
              <button onClick={() => onDelete(task.id)} className="text-text-muted hover:text-[hsl(348,75%,58%)] opacity-0 group-hover:opacity-100 transition-all p-1">Delete</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
})
