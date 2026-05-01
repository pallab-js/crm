import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCompaniesStore } from '../companiesStore'
import { useContactsStore } from '../contactsStore'
import { useActivityStore } from '../activityStore'

vi.mock('@/services/dataService', () => ({ dataService: { load: vi.fn(), save: vi.fn() } }))
vi.mock('../uiStore', () => ({ scheduleSave: vi.fn(), useUiStore: vi.fn() }))

const makeCompany = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Acme',
  domain: 'acme.com',
  industry: 'Tech',
  phone: '',
  address: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

const makeContact = (company_id: string) => ({
  id: crypto.randomUUID(),
  name: 'Bob',
  email: 'bob@acme.com',
  phone: '',
  status: 'lead',
  tags: [],
  company_id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

beforeEach(() => {
  useCompaniesStore.setState({ companies: [] })
  useContactsStore.setState({ contacts: [], notes: [], emails: [] })
  useActivityStore.setState({ dashboard: { recent: [] } })
})

describe('companiesStore', () => {
  it('addCompany appends a company', async () => {
    await useCompaniesStore.getState().addCompany(makeCompany())
    expect(useCompaniesStore.getState().companies).toHaveLength(1)
  })

  it('updateCompany updates fields', async () => {
    const company = makeCompany()
    await useCompaniesStore.getState().addCompany(company)
    await useCompaniesStore.getState().updateCompany(company.id, { name: 'NewCo' })
    expect(useCompaniesStore.getState().companies[0].name).toBe('NewCo')
  })

  it('deleteCompany removes company and unlinks contacts', async () => {
    const company = makeCompany()
    await useCompaniesStore.getState().addCompany(company)
    const contact = makeContact(company.id)
    useContactsStore.setState({ contacts: [contact], notes: [], emails: [] })
    await useCompaniesStore.getState().deleteCompany(company.id)
    expect(useCompaniesStore.getState().companies).toHaveLength(0)
    expect(useContactsStore.getState().contacts[0].company_id).toBeUndefined()
  })

  it('addCompany pushes an activity', async () => {
    await useCompaniesStore.getState().addCompany(makeCompany({ name: 'Globex' }))
    expect(useActivityStore.getState().dashboard.recent[0].message).toContain('Globex')
  })
})
