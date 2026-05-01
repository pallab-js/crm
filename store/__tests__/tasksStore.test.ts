import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTasksStore } from '../tasksStore'
import { useActivityStore } from '../activityStore'

vi.mock('@/services/dataService', () => ({ dataService: { load: vi.fn(), save: vi.fn() } }))
vi.mock('../uiStore', () => ({ scheduleSave: vi.fn(), useUiStore: vi.fn() }))
vi.mock('../contactsStore', () => ({ useContactsStore: { getState: () => ({ contacts: [] }) } }))
vi.mock('../companiesStore', () => ({ useCompaniesStore: { getState: () => ({ companies: [] }) } }))
vi.mock('../dealsStore', () => ({ useDealsStore: { getState: () => ({ deals: [] }) } }))

const makeTask = (overrides = {}) => ({
  id: crypto.randomUUID(),
  title: 'Follow up',
  description: '',
  status: 'todo',
  due_date: '2099-01-01',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

beforeEach(() => {
  useTasksStore.setState({ tasks: [] })
  useActivityStore.setState({ dashboard: { recent: [] } })
})

describe('tasksStore', () => {
  it('addTask appends a task', async () => {
    await useTasksStore.getState().addTask(makeTask())
    expect(useTasksStore.getState().tasks).toHaveLength(1)
  })

  it('updateTask marks task done', async () => {
    const task = makeTask()
    await useTasksStore.getState().addTask(task)
    await useTasksStore.getState().updateTask(task.id, { status: 'done' })
    expect(useTasksStore.getState().tasks[0].status).toBe('done')
  })

  it('updateTask with recurring creates a new task on completion', async () => {
    const task = makeTask({ recurring: 'weekly' })
    await useTasksStore.getState().addTask(task)
    await useTasksStore.getState().updateTask(task.id, { status: 'done' })
    const tasks = useTasksStore.getState().tasks
    expect(tasks).toHaveLength(2)
    const newTask = tasks.find(t => t.id !== task.id)
    expect(newTask?.status).toBe('todo')
    expect(newTask?.recurring).toBe('weekly')
  })

  it('deleteTask removes the task', async () => {
    const task = makeTask()
    await useTasksStore.getState().addTask(task)
    await useTasksStore.getState().deleteTask(task.id)
    expect(useTasksStore.getState().tasks).toHaveLength(0)
  })

  it('batchAddTasks appends multiple tasks', async () => {
    await useTasksStore.getState().batchAddTasks([makeTask(), makeTask()])
    expect(useTasksStore.getState().tasks).toHaveLength(2)
  })

  it('completing a task pushes completed activity', async () => {
    const task = makeTask({ title: 'Call client' })
    await useTasksStore.getState().addTask(task)
    await useTasksStore.getState().updateTask(task.id, { status: 'done' })
    const recent = useActivityStore.getState().dashboard.recent
    expect(recent[0].message).toContain('Completed task')
  })
})
