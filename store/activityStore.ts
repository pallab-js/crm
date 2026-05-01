import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Activity, DashboardState } from '@/lib/ipc'

interface ActivityStore {
  dashboard: DashboardState
  pushActivity: (message: string) => void
  setDashboard: (dashboard: DashboardState) => void
}

export const createActivity = (message: string): Activity => ({
  id: crypto.randomUUID(),
  message,
  timestamp: new Date().toISOString(),
})

export const useActivityStore = create<ActivityStore>()(
  subscribeWithSelector((set, get) => ({
    dashboard: { recent: [] },

    pushActivity: (message: string) => {
      const activity = createActivity(message)
      const recent = [activity, ...get().dashboard.recent].slice(0, 20)
      set({ dashboard: { recent } })
    },

    setDashboard: (dashboard: DashboardState) => set({ dashboard }),
  }))
)
