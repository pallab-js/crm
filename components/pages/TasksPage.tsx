'use client'
import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { isValidName } from '@/lib/validation'

const TASK_STATUSES = ['todo', 'in_progress', 'done']
const RECURRING_OPTIONS = ['', 'daily', 'weekly', 'monthly']

export function TasksPage() {
  const { tasks, contacts, deals, addTask, updateTask, deleteTask } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
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
      created_at: now,
      updated_at: now,
    })
    setFormData({ title: '', description: '', status: 'todo', due_date: '', recurring: '', contact_id: '', deal_id: '' })
    setShowForm(false)
  }

  const getContactName = (id?: string) => {
    if (!id) return ''
    const contact = contacts.find(c => c.id === id)
    return contact?.name || ''
  }

  const statusColors: Record<string, string> = {
    todo: 'text-text-muted',
    in_progress: 'text-[hsl(53,92%,50%)]',
    done: 'text-brand',
  }

  const todoCount = tasks.filter(t => t.status === 'todo').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length
  const doneCount = tasks.filter(t => t.status === 'done').length

  const filteredTasks = tasks
    .filter(t => {
      if (filter !== 'all' && t.status !== filter) return false
      if (search) {
        const searchLower = search.toLowerCase()
        return t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
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
          <p className="text-text-secondary mt-2">Manage your tasks and activities</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-text-muted text-sm">To Do</p>
          <p className="text-[36px] text-text-primary">{todoCount}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">In Progress</p>
          <p className="text-[36px] text-[hsl(53,92%,50%)]">{inProgressCount}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Done</p>
          <p className="text-[36px] text-brand">{doneCount}</p>
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
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary"
        >
          <option value="all">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-muted text-sm mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
                {titleError && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{titleError}</p>}
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Recurring</label>
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
                <label className="block text-text-muted text-sm mb-1">Related Contact</label>
                <select
                  value={formData.contact_id}
                  onChange={e => setFormData({ ...formData, contact_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  <option value="">None</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Related Deal</label>
                <select
                  value={formData.deal_id}
                  onChange={e => setFormData({ ...formData, deal_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  <option value="">None</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-text-muted text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
            </div>
            <Button type="submit">Save Task</Button>
          </form>
        </Card>
      )}

      {filteredTasks.length === 0 ? (
        <Card>
          <p className="text-text-muted text-center py-8">
            {search || filter !== 'all' ? 'No tasks found matching your criteria' : 'No tasks yet. Add your first task to get started.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <Card key={task.id} className={task.status === 'done' ? 'opacity-60' : ''}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={e => updateTask(task.id, { status: e.target.checked ? 'done' : 'todo' })}
                    className="w-5 h-5 accent-brand"
                  />
                  <div>
                    <p className={`text-text-primary font-medium ${task.status === 'done' ? 'line-through' : ''}`}>
                      {task.title}
                      {task.recurring && <span className="ml-2 text-xs text-brand">🔄 {task.recurring}</span>}
                    </p>
                    {task.description && (
                      <p className="text-text-muted text-sm">{task.description}</p>
                    )}
                    <p className="text-text-muted text-xs mt-1">
                      {task.due_date && `Due: ${new Date(task.due_date).toLocaleDateString()}`}
                      {task.contact_id && ` · ${getContactName(task.contact_id)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
                  <select
                    value={task.status}
                    onChange={e => updateTask(task.id, { status: e.target.value })}
                    className="bg-bg-deep border border-border-base rounded-[6px] px-2 py-1 text-text-primary text-sm"
                  >
                    {TASK_STATUSES.map(status => (
                      <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setConfirmDelete(task.id)}
                    className="text-text-muted hover:text-[hsl(348,75%,58%)] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this task? This cannot be undone."
          onConfirm={() => { deleteTask(confirmDelete); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}