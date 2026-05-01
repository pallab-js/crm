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
  saveError: string | null
  load: () => Promise<void>
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>
  setCurrentView: (view: string) => void
  clearSaveError: () => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  tags: ['VIP', 'Follow up', 'Hot lead', 'Cold'],
  monthly_target: 100000,
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null
let saveRetries: number = 0
const MAX_SAVE_RETRIES = 3

const sanitizeError = (err: unknown): string => {
  if (err instanceof Error) {
    // Avoid leaking full object details - return only safe message
    return err.message || 'An error occurred'
  }
  return 'An unknown error occurred'
}

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
      saveRetries = 0
      saveTimeout = null
      // Clear any previous save error on success
      const state = useUiStore.getState()
      if (state.saveError) useUiStore.setState({ saveError: null })
    } catch (err) {
      const safeMessage = sanitizeError(err)
      console.error('[OpenCRM] Sync error occurred')
      saveRetries++
      if (saveRetries < MAX_SAVE_RETRIES) {
        // Retry after delay with exponential backoff
        saveTimeout = setTimeout(() => scheduleSave(), 2000 * saveRetries)
      } else {
        useUiStore.setState({ saveError: safeMessage })
        saveTimeout = null
        saveRetries = 0
      }
    }
  }, 1000)
}

export const useUiStore = create<UiStore>()(
  subscribeWithSelector((set, get) => ({
    loading: false,
    error: null,
    saveError: null,
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
        console.error('[OpenCRM] Load error occurred')
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

    clearSaveError: () => set({ saveError: null }),
  }))
)
