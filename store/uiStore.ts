import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { AppSettings } from '@/lib/ipc'
import { dataService } from '@/services/dataService'
import { useActivityStore } from './activityStore'
import { useContactsStore } from './contactsStore'
import { useCompaniesStore } from './companiesStore'
import { useDealsStore } from './dealsStore'
import { useTasksStore } from './tasksStore'

interface UiStore {
  loading: boolean
  error: string | null
  currentView: string
  settings: AppSettings
  load: () => Promise<void>
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
  setCurrentView: (view: string) => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  tags: ['VIP', 'Follow up', 'Hot lead', 'Cold'],
  monthly_target: 100000,
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null

export const scheduleSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    try {
      const { dashboard } = useActivityStore.getState()
      const { companies } = useCompaniesStore.getState()
      const { contacts, notes, emails } = useContactsStore.getState()
      const { deals } = useDealsStore.getState()
      const { tasks } = useTasksStore.getState()
      const { settings } = useUiStore.getState()
      await dataService.save({ dashboard, companies, contacts, notes, emails, deals, tasks, settings })
      saveTimeout = null
    } catch (err) {
      console.error('[OpenCRM] Sync error:', err)
    }
  }, 1000)
}

export const useUiStore = create<UiStore>()(
  subscribeWithSelector((set, get) => ({
    loading: false,
    error: null,
    currentView: 'dashboard',
    settings: defaultSettings,

    load: async () => {
      set({ loading: true, error: null })
      try {
        const data = await dataService.load()
        useActivityStore.getState().setDashboard(data.dashboard)
        useCompaniesStore.getState().setCompanies(data.companies)
        useContactsStore.getState().setContacts(data.contacts, data.notes, data.emails)
        useDealsStore.getState().setDeals(data.deals)
        useTasksStore.getState().setTasks(data.tasks)
        set({ settings: data.settings, loading: false })
        document.documentElement.setAttribute('data-theme', data.settings.theme ?? 'dark')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load data'
        console.error('[OpenCRM] Load error:', msg)
        set({ loading: false, error: msg })
      }
    },

    updateSettings: async (updates: Partial<AppSettings>) => {
      const settings = { ...get().settings, ...updates }
      set({ settings })
      if (settings.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme)
      }
      scheduleSave()
    },

    setCurrentView: (view: string) => set({ currentView: view }),
  }))
)
