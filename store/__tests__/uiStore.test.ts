import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUiStore } from '../uiStore'

vi.mock('@/services/dataService', () => ({ dataService: { load: vi.fn(), save: vi.fn() } }))
vi.mock('../activityStore', () => ({ useActivityStore: { getState: () => ({ dashboard: { recent: [] }, setDashboard: vi.fn() }) } }))
vi.mock('../contactsStore', () => ({ useContactsStore: { getState: () => ({ contacts: [], notes: [], emails: [], setContacts: vi.fn() }) } }))
vi.mock('../companiesStore', () => ({ useCompaniesStore: { getState: () => ({ companies: [], setCompanies: vi.fn() }) } }))
vi.mock('../dealsStore', () => ({ useDealsStore: { getState: () => ({ deals: [], setDeals: vi.fn() }) } }))
vi.mock('../tasksStore', () => ({ useTasksStore: { getState: () => ({ tasks: [], setTasks: vi.fn() }) } }))

beforeEach(() => {
  useUiStore.setState({ currentView: 'dashboard', loading: false, error: null })
})

describe('uiStore', () => {
  it('setCurrentView updates currentView', () => {
    useUiStore.getState().setCurrentView('contacts')
    expect(useUiStore.getState().currentView).toBe('contacts')
  })

  it('updateSettings merges settings', async () => {
    await useUiStore.getState().updateSettings({ monthly_target: 200000 })
    expect(useUiStore.getState().settings.monthly_target).toBe(200000)
  })

  it('updateSettings preserves other settings fields', async () => {
    await useUiStore.getState().updateSettings({ monthly_target: 50000 })
    expect(useUiStore.getState().settings.theme).toBe('dark')
    expect(useUiStore.getState().settings.tags).toHaveLength(4)
  })
})
