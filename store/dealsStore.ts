import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Deal } from '@/lib/ipc'
import { STAGE_PROBABILITIES } from '@/lib/constants'
import { useActivityStore } from './activityStore'
import { useContactsStore } from './contactsStore'
import { scheduleSave } from './uiStore'

interface DealsStore {
  deals: Deal[]
  setDeals: (deals: Deal[]) => void
  addDeal: (deal: Deal) => Promise<void>
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<void>
  deleteDeal: (id: string) => Promise<void>
  batchAddDeals: (records: Deal[]) => Promise<void>
}

export const useDealsStore = create<DealsStore>()(
  subscribeWithSelector((set, get) => ({
    deals: [],

    setDeals: (deals) => set({ deals }),

    addDeal: async (deal: Deal) => {
      set({ deals: [...get().deals, deal] })
      const contact = useContactsStore.getState().contacts.find(c => c.id === deal.contact_id)
      useActivityStore.getState().pushActivity(
        `New deal: ${deal.title} ($${deal.value.toLocaleString()})${contact ? ` for ${contact.name}` : ''}`
      )
      scheduleSave()
    },

    updateDeal: async (id: string, updates: Partial<Deal>) => {
      const deal = get().deals.find(d => d.id === id)
      const newProbability = updates.stage
        ? STAGE_PROBABILITIES[updates.stage] ?? deal?.probability ?? 10
        : (updates.probability ?? deal?.probability ?? 10)
      set({
        deals: get().deals.map(d =>
          d.id === id ? { ...d, ...updates, probability: newProbability, updated_at: new Date().toISOString() } : d
        ),
      })
      let msg = `Updated deal: ${deal?.title ?? 'Unknown'}`
      if (updates.stage === 'closed_won') msg = `Won deal: ${deal?.title ?? 'Unknown'} ($${deal?.value.toLocaleString()})`
      else if (updates.stage) msg = `Deal moved to ${updates.stage}: ${deal?.title ?? 'Unknown'} (${newProbability}% prob)`
      useActivityStore.getState().pushActivity(msg)
      scheduleSave()
    },

    deleteDeal: async (id: string) => {
      const deal = get().deals.find(d => d.id === id)
      set({ deals: get().deals.filter(d => d.id !== id) })
      useActivityStore.getState().pushActivity(`Deleted deal: ${deal?.title ?? 'Unknown'}`)
      scheduleSave()
    },

    batchAddDeals: async (records: Deal[]) => {
      set({ deals: [...get().deals, ...records] })
      scheduleSave()
    },
  }))
)
