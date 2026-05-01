import { fetchAppData, saveAppData, AppData } from '@/lib/ipc'

export const dataService = {
  load: async (): Promise<AppData> => {
    try {
      return await fetchAppData()
    } catch (err) {
      // One retry
      try {
        return await fetchAppData()
      } catch {
        throw err instanceof Error ? err : new Error('Failed to load app data')
      }
    }
  },

  save: async (data: AppData): Promise<void> => {
    try {
      await saveAppData(data)
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to save app data')
    }
  },
}
