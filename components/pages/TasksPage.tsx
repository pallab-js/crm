'use client'
import { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Task } from '@/lib/ipc'
import { isValidName } from '@/lib/validation'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Card } from '@/components/ui/Card'
import { TasksKanban } from '@/components/dashboard/TasksKanban'
import { TaskDetailModal } from '@/components/dashboard/TaskDetailModal'
import { TaskFilters } from '@/components/features/tasks/TaskFilters'
import { TaskForm, TaskFormData } from '@/components/features/tasks/TaskForm'
import { TaskTable } from '@/components/features/tasks/TaskTable'

const EMPTY_FORM: TaskFormData = { title: '', description: '', status: 'todo', due_date: '', recurring: '', contact_id: '', deal_id: '', company_id: '' }
const isOverdue = (date?: string) => !!date && new Date(date) < new Date(new Date().setHours(0, 0, 0, 0))

export function TasksPage() {
  const { tasks, contacts, deals, companies, addTask, updateTask, deleteTask } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>(EMPTY_FORM)
  const [titleError, setTitleError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const getContactName = useCallback((id?: string) => contacts.find(c => c.id === id)?.name ?? '', [contacts])
  const getDealTitle = useCallback((id?: string) => deals.find(d => d.id === id)?.title ?? '', [deals])
  const getCompanyName = useCallback((id?: string) => companies.find(c => c.id === id)?.name ?? '', [companies])

  const filteredTasks = useMemo(() =>
    tasks
      .filter(t => {
        if (filter !== 'all' && t.status !== filter) return false
        if (search) {
          const s = search.toLowerCase()
          return t.title.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s) || getContactName(t.contact_id).toLowerCase().includes(s)
        }
        return true
      })
      .sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1
        if (a.status !== 'done' && b.status === 'done') return -1
        return new Date(a.due_date || '9999').getTime() - new Date(b.due_date || '9999').getTime()
      }),
    [tasks, filter, search, getContactName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidName(formData.title)) { setTitleError('Title is required'); return }
    setTitleError('')
    const now = new Date().toISOString()
    await addTask({ id: crypto.randomUUID(), ...formData, recurring: formData.recurring || undefined, contact_id: formData.contact_id || undefined, deal_id: formData.deal_id || undefined, company_id: formData.company_id || undefined, created_at: now, updated_at: now })
    setFormData(EMPTY_FORM)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <TaskFilters search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} viewMode={viewMode} onViewModeChange={setViewMode} showForm={showForm} onToggleForm={() => setShowForm(!showForm)} />

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-bg-deep/50 border-none"><p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-1">To Do</p><p className="text-[32px] text-text-primary font-bold">{tasks.filter(t => t.status === 'todo').length}</p></Card>
        <Card className="bg-bg-deep/50 border-none"><p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-1">In Progress</p><p className="text-[32px] text-[hsl(53,92%,50%)] font-bold">{tasks.filter(t => t.status === 'in_progress').length}</p></Card>
        <Card className="bg-bg-deep/50 border-none"><p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-1">Done</p><p className="text-[32px] text-brand font-bold">{tasks.filter(t => t.status === 'done').length}</p></Card>
        <Card className="bg-bg-deep/50 border-none"><p className="text-text-muted text-[10px] uppercase tracking-wider font-bold mb-1">Overdue</p><p className="text-[32px] text-[hsl(348,75%,58%)] font-bold">{tasks.filter(t => t.status !== 'done' && isOverdue(t.due_date)).length}</p></Card>
      </div>

      {showForm && <TaskForm data={formData} onChange={setFormData} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} titleError={titleError} contacts={contacts} deals={deals} companies={companies} />}

      {viewMode === 'board' ? (
        <TasksKanban onTaskClick={setSelectedTask} />
      ) : (
        <TaskTable tasks={filteredTasks} onSelect={setSelectedTask} onUpdate={updateTask} onDelete={setConfirmDelete} getContactName={getContactName} search={search} filter={filter} />
      )}

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={updateTask}
          onDelete={id => { deleteTask(id); setSelectedTask(null) }}
          getContactName={getContactName} getDealTitle={getDealTitle} getCompanyName={getCompanyName} />
      )}

      {confirmDelete && (
        <ConfirmDialog message="Delete this task? This cannot be undone."
          onConfirm={() => { deleteTask(confirmDelete); setConfirmDelete(null); if (selectedTask?.id === confirmDelete) setSelectedTask(null) }}
          onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  )
}
