import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Task } from '@/lib/ipc'
import { useActivityStore } from './activityStore'
import { useContactsStore } from './contactsStore'
import { useCompaniesStore } from './companiesStore'
import { useDealsStore } from './dealsStore'
import { scheduleSave } from './uiStore'

interface TasksStore {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  batchAddTasks: (records: Task[]) => Promise<void>
}

export const useTasksStore = create<TasksStore>()(
  subscribeWithSelector((set, get) => ({
    tasks: [],

    setTasks: (tasks) => set({ tasks }),

    addTask: async (task: Task) => {
      const contact = task.contact_id ? useContactsStore.getState().contacts.find(c => c.id === task.contact_id) : null
      const company = task.company_id ? useCompaniesStore.getState().companies.find(c => c.id === task.company_id) : null
      const deal = task.deal_id ? useDealsStore.getState().deals.find(d => d.id === task.deal_id) : null
      set({ tasks: [...get().tasks, task] })
      useActivityStore.getState().pushActivity(
        `New task: ${task.title}${contact ? ` for ${contact.name}` : deal ? ` related to ${deal.title}` : company ? ` for ${company.name}` : ''}`
      )
      scheduleSave()
    },

    updateTask: async (id: string, updates: Partial<Task>) => {
      const task = get().tasks.find(t => t.id === id)
      const updatedTasks = get().tasks.map(t =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      )

      let msg = `Updated task: ${task?.title ?? 'Unknown'}`
      if (updates.status === 'done' && task?.status !== 'done') {
        msg = `Completed task: ${task?.title ?? 'Unknown'}`
        if (task?.recurring) {
          const nextDue = new Date()
          if (task.recurring === 'daily') nextDue.setDate(nextDue.getDate() + 1)
          else if (task.recurring === 'weekly') nextDue.setDate(nextDue.getDate() + 7)
          else if (task.recurring === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1)
          const now = new Date().toISOString()
          updatedTasks.push({
            ...task,
            id: crypto.randomUUID(),
            status: 'todo',
            due_date: nextDue.toISOString().split('T')[0],
            created_at: now,
            updated_at: now,
          })
        }
      }

      set({ tasks: updatedTasks })
      useActivityStore.getState().pushActivity(msg)
      scheduleSave()
    },

    deleteTask: async (id: string) => {
      const task = get().tasks.find(t => t.id === id)
      set({ tasks: get().tasks.filter(t => t.id !== id) })
      useActivityStore.getState().pushActivity(`Deleted task: ${task?.title ?? 'Unknown'}`)
      scheduleSave()
    },

    batchAddTasks: async (records: Task[]) => {
      set({ tasks: [...get().tasks, ...records] })
      scheduleSave()
    },
  }))
)
