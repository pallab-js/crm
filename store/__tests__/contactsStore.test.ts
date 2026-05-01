import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useContactsStore } from '../contactsStore'
import { useActivityStore } from '../activityStore'

// Mock dataService so no Tauri IPC is called
vi.mock('@/services/dataService', () => ({ dataService: { load: vi.fn(), save: vi.fn() } }))
// Mock scheduleSave to be a no-op
vi.mock('../uiStore', () => ({ scheduleSave: vi.fn(), useUiStore: vi.fn() }))

const makeContact = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Alice',
  email: 'alice@example.com',
  phone: '555-0001',
  status: 'lead',
  tags: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

const makeNote = (contact_id: string) => ({
  id: crypto.randomUUID(),
  contact_id,
  content: 'Test note',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

const makeEmail = (contact_id: string) => ({
  id: crypto.randomUUID(),
  contact_id,
  subject: 'Hello',
  body: 'Body',
  direction: 'outbound' as const,
  created_at: new Date().toISOString(),
})

beforeEach(() => {
  useContactsStore.setState({ contacts: [], notes: [], emails: [] })
  useActivityStore.setState({ dashboard: { recent: [] } })
})

describe('contactsStore', () => {
  it('addContact appends a contact', async () => {
    const contact = makeContact()
    await useContactsStore.getState().addContact(contact)
    expect(useContactsStore.getState().contacts).toHaveLength(1)
    expect(useContactsStore.getState().contacts[0].name).toBe('Alice')
  })

  it('updateContact updates fields and sets updated_at', async () => {
    const contact = makeContact()
    await useContactsStore.getState().addContact(contact)
    await useContactsStore.getState().updateContact(contact.id, { name: 'Bob' })
    const updated = useContactsStore.getState().contacts[0]
    expect(updated.name).toBe('Bob')
    expect(updated.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('deleteContact removes contact and cascades notes/emails', async () => {
    const contact = makeContact()
    await useContactsStore.getState().addContact(contact)
    await useContactsStore.getState().addNote(makeNote(contact.id))
    await useContactsStore.getState().addEmail(makeEmail(contact.id))
    await useContactsStore.getState().deleteContact(contact.id)
    const state = useContactsStore.getState()
    expect(state.contacts).toHaveLength(0)
    expect(state.notes).toHaveLength(0)
    expect(state.emails).toHaveLength(0)
  })

  it('addNote appends a note', async () => {
    const contact = makeContact()
    await useContactsStore.getState().addContact(contact)
    await useContactsStore.getState().addNote(makeNote(contact.id))
    expect(useContactsStore.getState().notes).toHaveLength(1)
  })

  it('deleteNote removes only the target note', async () => {
    const contact = makeContact()
    await useContactsStore.getState().addContact(contact)
    const note = makeNote(contact.id)
    await useContactsStore.getState().addNote(note)
    await useContactsStore.getState().deleteNote(note.id)
    expect(useContactsStore.getState().notes).toHaveLength(0)
  })

  it('batchAddContacts appends multiple contacts', async () => {
    const batch = [makeContact({ name: 'C1' }), makeContact({ name: 'C2' })]
    await useContactsStore.getState().batchAddContacts(batch)
    expect(useContactsStore.getState().contacts).toHaveLength(2)
  })

  it('addContact pushes an activity', async () => {
    await useContactsStore.getState().addContact(makeContact({ name: 'Eve' }))
    const recent = useActivityStore.getState().dashboard.recent
    expect(recent[0].message).toContain('Eve')
  })
})
