import { create } from 'zustand'
import { fetchAppData, saveAppData, AppData, Contact, Company, Note, Email, Deal, Task, Activity, AppSettings } from '@/lib/ipc'
import { STAGE_PROBABILITIES } from '@/lib/constants'

const createActivity = (message: string): Activity => ({
  id: crypto.randomUUID(),
  message,
  timestamp: new Date().toISOString(),
})

interface AppStore extends AppData {
  loading: boolean
  error: string | null
  currentView: string
  load: () => Promise<void>
  addCompany: (company: Company) => Promise<void>
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>
  deleteCompany: (id: string) => Promise<void>
  addContact: (contact: Contact) => Promise<void>
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  addNote: (note: Note) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  addEmail: (email: Email) => Promise<void>
  addDeal: (deal: Deal) => Promise<void>
  updateDeal: (id: string, deal: Partial<Deal>) => Promise<void>
  deleteDeal: (id: string) => Promise<void>
  addTask: (task: Task) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  batchAdd: (type: 'contacts' | 'deals' | 'tasks', records: (Contact | Deal | Task)[]) => Promise<void>
  setCurrentView: (view: string) => void
}

const initialState: AppData = {
  dashboard: { stats: [], recent: [] },
  companies: [],
  contacts: [],
  notes: [],
  emails: [],
  deals: [],
  tasks: [],
  settings: { theme: 'dark', tags: ['VIP', 'Follow up', 'Hot lead', 'Cold'] },
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,
  loading: false,
  error: null,
  currentView: 'dashboard',

  load: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchAppData()
      set({ ...data, loading: false })
      document.documentElement.setAttribute('data-theme', data.settings.theme ?? 'dark')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load data'
      console.error('[OpenCRM] Load error:', msg)
      set({ loading: false, error: msg })
    }
  },

  batchAdd: async (type: 'contacts' | 'deals' | 'tasks', records: (Contact | Deal | Task)[]) => {
    if (type === 'contacts') {
      set({ contacts: [...get().contacts, ...(records as Contact[])] })
    } else if (type === 'deals') {
      set({ deals: [...get().deals, ...(records as Deal[])] })
    } else if (type === 'tasks') {
      set({ tasks: [...get().tasks, ...(records as Task[])] })
    }
    const s = get()
    await saveAppData({
      dashboard: s.dashboard,
      companies: s.companies,
      contacts: s.contacts,
      notes: s.notes,
      emails: s.emails,
      deals: s.deals,
      tasks: s.tasks,
      settings: s.settings,
    })
  },

  addCompany: async (company: Company) => {
    const companies = [...get().companies, company]
    const activity = createActivity(`Added company: ${company.name}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ companies, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  updateCompany: async (id: string, updates: Partial<Company>) => {
    const company = get().companies.find(c => c.id === id)
    const companies = get().companies.map(c => 
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    )
    const activity = createActivity(`Updated company: ${company?.name || 'Unknown'}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ companies, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  deleteCompany: async (id: string) => {
    const company = get().companies.find(c => c.id === id)
    const companies = get().companies.filter(c => c.id !== id)
    const contacts = get().contacts.map(c => c.company_id === id ? { ...c, company_id: undefined } : c)
    const activity = createActivity(`Deleted company: ${company?.name || 'Unknown'}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ companies, contacts, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies,
      contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  addContact: async (contact: Contact) => {
    const contacts = [...get().contacts, contact]
    const activity = createActivity(`Added contact: ${contact.name}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ contacts, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  updateContact: async (id: string, updates: Partial<Contact>) => {
    const contact = get().contacts.find(c => c.id === id)
    const contacts = get().contacts.map(c => 
      c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
    )
    const activity = createActivity(`Updated contact: ${contact?.name || 'Unknown'}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ contacts, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  deleteContact: async (id: string) => {
    const contact = get().contacts.find(c => c.id === id)
    const contacts = get().contacts.filter(c => c.id !== id)
    const notes = get().notes.filter(n => n.contact_id !== id)
    const emails = get().emails.filter(e => e.contact_id !== id)
    const activity = createActivity(`Deleted contact: ${contact?.name || 'Unknown'}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ contacts, notes, emails, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts,
      notes,
      emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  addNote: async (note: Note) => {
    const notes = [...get().notes, note]
    const activity = createActivity(`Added note to contact`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ notes, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts: get().contacts,
      notes,
      emails: get().emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  deleteNote: async (id: string) => {
    const notes = get().notes.filter(n => n.id !== id)
    set({ notes })
    await saveAppData({
      dashboard: get().dashboard,
      companies: get().companies,
      contacts: get().contacts,
      notes,
      emails: get().emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  addEmail: async (email: Email) => {
    const emails = [...get().emails, email]
    const activity = createActivity(`Email ${email.direction}: ${email.subject}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ emails, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts: get().contacts,
      notes: get().notes,
      emails,
      deals: get().deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  addDeal: async (deal: Deal) => {
    const deals = [...get().deals, deal]
    const activity = createActivity(`New deal: ${deal.title} ($${deal.value.toLocaleString()})`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ deals, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  updateDeal: async (id: string, updates: Partial<Deal>) => {
    const deal = get().deals.find(d => d.id === id)
    const newProbability = updates.stage ? STAGE_PROBABILITIES[updates.stage] || deal?.probability || 10 : (updates.probability ?? deal?.probability ?? 10)
    const deals = get().deals.map(d => 
      d.id === id ? { ...d, ...updates, probability: newProbability, updated_at: new Date().toISOString() } : d
    )
    let activityMessage = `Updated deal: ${deal?.title || 'Unknown'}`
    if (updates.stage === 'closed_won') {
      activityMessage = `Won deal: ${deal?.title || 'Unknown'} ($${deal?.value.toLocaleString()})`
    } else if (updates.stage) {
      activityMessage = `Deal moved to ${updates.stage}: ${deal?.title || 'Unknown'} (${newProbability}% prob)`
    }
    const activity = createActivity(activityMessage)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ deals, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  deleteDeal: async (id: string) => {
    const deal = get().deals.find(d => d.id === id)
    const deals = get().deals.filter(d => d.id !== id)
    const activity = createActivity(`Deleted deal: ${deal?.title || 'Unknown'}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ deals, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals,
      tasks: get().tasks,
      settings: get().settings,
    })
  },

  addTask: async (task: Task) => {
    const tasks = [...get().tasks, task]
    const activity = createActivity(`New task: ${task.title}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ tasks, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks,
      settings: get().settings,
    })
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const task = get().tasks.find(t => t.id === id)
    const tasks = get().tasks.map(t => 
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    )
    
    let activityMessage = `Updated task: ${task?.title || 'Unknown'}`
    if (updates.status === 'done' && task?.status !== 'done') {
      activityMessage = `Completed task: ${task?.title || 'Unknown'}`
      
      if (task?.recurring) {
        const nextDue = new Date()
        if (task.recurring === 'daily') nextDue.setDate(nextDue.getDate() + 1)
        else if (task.recurring === 'weekly') nextDue.setDate(nextDue.getDate() + 7)
        else if (task.recurring === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1)
        
        const now = new Date().toISOString()
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          status: 'todo',
          due_date: nextDue.toISOString().split('T')[0],
          created_at: now,
          updated_at: now,
        }
        tasks.push(newTask)
      }
    }
    
    const activity = createActivity(activityMessage)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ tasks, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks,
      settings: get().settings,
    })
  },

  deleteTask: async (id: string) => {
    const task = get().tasks.find(t => t.id === id)
    const tasks = get().tasks.filter(t => t.id !== id)
    const activity = createActivity(`Deleted task: ${task?.title || 'Unknown'}`)
    const recent = [activity, ...get().dashboard.recent].slice(0, 20)
    set({ tasks, dashboard: { ...get().dashboard, recent } })
    await saveAppData({
      dashboard: { ...get().dashboard, recent },
      companies: get().companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks,
      settings: get().settings,
    })
  },

  updateSettings: async (updates: Partial<AppSettings>) => {
    const settings = { ...get().settings, ...updates }
    set({ settings })
    if (settings.theme) {
      document.documentElement.setAttribute('data-theme', settings.theme)
    }
    await saveAppData({
      dashboard: get().dashboard,
      companies: get().companies,
      contacts: get().contacts,
      notes: get().notes,
      emails: get().emails,
      deals: get().deals,
      tasks: get().tasks,
      settings,
    })
  },

  setCurrentView: (view: string) => set({ currentView: view }),
}))