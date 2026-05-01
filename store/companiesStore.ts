import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Company } from '@/lib/ipc'
import { useActivityStore } from './activityStore'
import { useContactsStore } from './contactsStore'
import { scheduleSave } from './uiStore'

interface CompaniesStore {
  companies: Company[]
  setCompanies: (companies: Company[]) => void
  addCompany: (company: Company) => Promise<void>
  updateCompany: (id: string, updates: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>
}

export const useCompaniesStore = create<CompaniesStore>()(
  subscribeWithSelector((set, get) => ({
    companies: [],

    setCompanies: (companies) => set({ companies }),

    addCompany: async (company: Company) => {
      set({ companies: [...get().companies, company] })
      useActivityStore.getState().pushActivity(`Added company: ${company.name}`)
      scheduleSave()
    },

    updateCompany: async (id: string, updates: Partial<Company>) => {
      const company = get().companies.find(c => c.id === id)
      set({
        companies: get().companies.map(c =>
          c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
        ),
      })
      useActivityStore.getState().pushActivity(`Updated company: ${company?.name ?? 'Unknown'}`)
      scheduleSave()
    },

    deleteCompany: async (id: string) => {
      const company = get().companies.find(c => c.id === id)
      set({ companies: get().companies.filter(c => c.id !== id) })
      // Cascade: unlink contacts from this company
      const { contacts } = useContactsStore.getState()
      useContactsStore.setState({
        contacts: contacts.map(c => c.company_id === id ? { ...c, company_id: undefined } : c),
      })
      useActivityStore.getState().pushActivity(`Deleted company: ${company?.name ?? 'Unknown'}`)
      scheduleSave()
    },
  }))
)
