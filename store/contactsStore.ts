import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Contact, Note, Email } from '@/lib/ipc'
import { useActivityStore } from './activityStore'
import { scheduleSave } from './uiStore'

interface ContactsStore {
  contacts: Contact[]
  notes: Note[]
  emails: Email[]
  setContacts: (contacts: Contact[], notes: Note[], emails: Email[]) => void
  addContact: (contact: Contact) => Promise<void>
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  addNote: (note: Note) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  addEmail: (email: Email) => Promise<void>
  batchAddContacts: (records: Contact[]) => Promise<void>
}

export const useContactsStore = create<ContactsStore>()(
  subscribeWithSelector((set, get) => ({
    contacts: [],
    notes: [],
    emails: [],

    setContacts: (contacts, notes, emails) => set({ contacts, notes, emails }),

    addContact: async (contact: Contact) => {
      set({ contacts: [...get().contacts, contact] })
      useActivityStore.getState().pushActivity(`Added contact: ${contact.name}`)
      scheduleSave()
    },

    updateContact: async (id: string, updates: Partial<Contact>) => {
      const contact = get().contacts.find(c => c.id === id)
      set({
        contacts: get().contacts.map(c =>
          c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
        ),
      })
      useActivityStore.getState().pushActivity(`Updated contact: ${contact?.name ?? 'Unknown'}`)
      scheduleSave()
    },

    deleteContact: async (id: string) => {
      const contact = get().contacts.find(c => c.id === id)
      set({
        contacts: get().contacts.filter(c => c.id !== id),
        notes: get().notes.filter(n => n.contact_id !== id),
        emails: get().emails.filter(e => e.contact_id !== id),
      })
      useActivityStore.getState().pushActivity(`Deleted contact: ${contact?.name ?? 'Unknown'}`)
      scheduleSave()
    },

    addNote: async (note: Note) => {
      set({ notes: [...get().notes, note] })
      useActivityStore.getState().pushActivity('Added note to contact')
      scheduleSave()
    },

    deleteNote: async (id: string) => {
      set({ notes: get().notes.filter(n => n.id !== id) })
      scheduleSave()
    },

    addEmail: async (email: Email) => {
      set({ emails: [...get().emails, email] })
      useActivityStore.getState().pushActivity(`Email ${email.direction}: ${email.subject}`)
      scheduleSave()
    },

    batchAddContacts: async (records: Contact[]) => {
      set({ contacts: [...get().contacts, ...records] })
      scheduleSave()
    },
  }))
)
