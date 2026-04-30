'use client'
import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { isValidName } from '@/lib/validation'
import { TasksKanban } from '@/components/dashboard/TasksKanban'
import { TaskDetailModal } from '@/components/dashboard/TaskDetailModal'
import { List, LayoutGrid, Calendar, User, Building2, Briefcase, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const TASK_STATUSES = ['todo', 'in_progress', 'done']

export function TasksPage() {
  const { tasks, contacts, deals, companies, addTask, updateTask, deleteTask } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [selectedTask, setSelectedTask] = useState<typeof tasks[0] | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [titleError, setTitleError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    due_date: '',
    recurring: '',
    contact_id: '',
    deal_id: '',
    company_id: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidName(formData.title)) {
      setTitleError('Title is required')
      return
    }
    setTitleError('')
    const now = new Date().toISOString()
    await addTask({
      id: crypto.randomUUID(),
      ...formData,
      recurring: formData.recurring || undefined,
      contact_id: formData.contact_id || undefined,
      deal_id: formData.deal_id || undefined,
      company_id: formData.company_id || undefined,
      created_at: now,
      updated_at: now,
    })
    setFormData({ title: '', description: '', status: 'todo', due_date: '', recurring: '', contact_id: '', deal_id: '', company_id: '' })
    setShowForm(false)
  }

  const getContactName = (id?: string) => contacts.find(c => c.id === id)?.name || ''
  const getDealTitle = (id?: string) => deals.find(d => d.id === id)?.title || ''
  const getCompanyName = (id?: string) => companies.find(c => c.id === id)?.name || ''

  const isOverdue = (date?: string) => {
    if (!date) return false
    return new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))
  }

  const statusColors: Record<string, string> = {
    todo: 'text-text-muted',
    in_progress: 'text-[hsl(53,92%,50%)]',
    done: 'text-brand',
  }

  const filteredTasks = tasks
    .filter(t => {
      if (filter !== 'all' && t.status !== filter) return false
      if (search) {
        const searchLower = search.toLowerCase()
        return t.title.toLowerCase().includes(searchLower) ||
          (t.description?.toLowerCase().includes(searchLower)) ||
          getContactName(t.contact_id).toLowerCase().includes(searchLower)
      }
      return true
    })
    .sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1
      if (a.status !== 'done' && b.status === 'done') return -1
      return new Date(a.due_date || '9999').getTime() - new Date(b.due_date || '9999').getTime()
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Tasks</h1>
          <p className="text-text-secondary mt-2">Organize your workflow and follow-ups</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-bg-deep border border-border-base rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'list' ? "bg-bg shadow-sm text-brand" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'board' ? "bg-bg shadow-sm text-brand" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Task'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-bg-deep/50 border-none">
          <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-1">To Do</p>
          <p className="text-[32px] text-text-primary font-bold">{tasks.filter(t => t.status === 'todo').length}</p>
        </Card>
        <Card className="bg-bg-deep/50 border-none">
          <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-1">In Progress</p>
          <p className="text-[32px] text-[hsl(53,92%,50%)] font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p>
        </Card>
        <Card className="bg-bg-deep/50 border-none">
          <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-1">Done</p>
          <p className="text-[32px] text-brand font-bold">{tasks.filter(t => t.status === 'done').length}</p>
        </Card>
        <Card className="bg-bg-deep/50 border-none">
          <p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-1">Overdue</p>
          <p className="text-[32px] text-[hsl(348,75%,58%)] font-bold">{tasks.filter(t => t.status !== 'done' && isOverdue(t.due_date)).length}</p>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-bg-deep border border-border-base rounded-[6px] px-4 py-2 pl-10 text-text-primary placeholder:text-text-muted focus:border-brand-border focus:outline-none"
          />
          <LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {showForm && (
        <Card className="border-brand/30 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-text-muted text-[10px] uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="What needs to be done?"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary text-lg focus:border-brand-border focus:outline-none"
                />
                {titleError && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{titleError}</p>}
              </div>
              <div>
                <label className="block text-text-muted text-[10px] uppercase mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-[10px] uppercase mb-1">Recurrence</label>
                <select
                  value={formData.recurring}
                  onChange={e => setFormData({ ...formData, recurring: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  <option value="">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-[10px] uppercase mb-1">Related Contact</label>
                <select
                  value={formData.contact_id}
                  onChange={e => setFormData({ ...formData, contact_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none text-sm"
                >
                  <option value="">None</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-[10px] uppercase mb-1">Related Deal</label>
                <select
                  value={formData.deal_id}
                  onChange={e => setFormData({ ...formData, deal_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none text-sm"
                >
                  <option value="">None</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-text-muted text-[10px] uppercase mb-1">Related Company</label>
                <select
                  value={formData.company_id}
                  onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none text-sm"
                >
                  <option value="">None</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-text-muted text-[10px] uppercase mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Task</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {viewMode === 'board' ? (
        <TasksKanban onTaskClick={setSelectedTask} />
      ) : filteredTasks.length === 0 ? (
        <Card className="py-12 border-dashed">
          <div className="text-center">
            <Clock className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-20" />
            <p className="text-text-muted">
              {search || filter !== 'all' ? 'No tasks found matching your criteria' : 'Clean slate! Add your first task to get started.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <Card 
              key={task.id} 
              className={cn(
                "group cursor-pointer hover:border-brand-border transition-colors",
                task.status === 'done' && "opacity-60"
              )}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={e => updateTask(task.id, { status: e.target.checked ? 'done' : 'todo' })}
                      className="w-5 h-5 accent-brand cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-text-primary font-medium ${task.status === 'done' ? 'line-through' : ''}`}>
                        {task.title}
                      </p>
                      {isOverdue(task.due_date) && task.status !== 'done' && (
                        <Badge variant="secondary" className="bg-[hsl(348,75%,58%)]/10 text-[hsl(348,75%,58%)] border-none text-[8px] h-4">OVERDUE</Badge>
                      )}
                      {task.recurring && (
                        <span className="text-[10px] text-brand px-1.5 py-0.5 bg-brand/10 rounded flex items-center gap-1">
                          🔄 {task.recurring}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {task.due_date && (
                        <span className={cn(
                          "text-xs flex items-center gap-1",
                          isOverdue(task.due_date) && task.status !== 'done' ? "text-[hsl(348,75%,58%)] font-semibold" : "text-text-muted"
                        )}>
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.contact_id && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {getContactName(task.contact_id)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                  <Badge className={cn("text-[10px]", statusColors[task.status])}>{task.status.replace('_', ' ')}</Badge>
                  <button
                    onClick={() => setConfirmDelete(task.id)}
                    className="text-text-muted hover:text-[hsl(348,75%,58%)] opacity-0 group-hover:opacity-100 transition-all p-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={(id) => { deleteTask(id); setSelectedTask(null) }}
          getContactName={getContactName}
          getDealTitle={getDealTitle}
          getCompanyName={getCompanyName}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this task? This cannot be undone."
          onConfirm={() => { 
            deleteTask(confirmDelete)
            setConfirmDelete(null)
            if (selectedTask?.id === confirmDelete) setSelectedTask(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}