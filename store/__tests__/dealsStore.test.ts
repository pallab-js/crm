import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDealsStore } from '../dealsStore'
import { useActivityStore } from '../activityStore'

vi.mock('@/services/dataService', () => ({ dataService: { load: vi.fn(), save: vi.fn() } }))
vi.mock('../uiStore', () => ({ scheduleSave: vi.fn(), useUiStore: vi.fn() }))
vi.mock('../contactsStore', () => ({ useContactsStore: { getState: () => ({ contacts: [] }) } }))

const makeDeal = (overrides = {}) => ({
  id: crypto.randomUUID(),
  title: 'Big Sale',
  value: 5000,
  stage: 'lead',
  probability: 10,
  contact_id: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

beforeEach(() => {
  useDealsStore.setState({ deals: [] })
  useActivityStore.setState({ dashboard: { recent: [] } })
})

describe('dealsStore', () => {
  it('addDeal appends a deal', async () => {
    await useDealsStore.getState().addDeal(makeDeal())
    expect(useDealsStore.getState().deals).toHaveLength(1)
  })

  it('updateDeal maps stage to probability', async () => {
    const deal = makeDeal()
    await useDealsStore.getState().addDeal(deal)
    await useDealsStore.getState().updateDeal(deal.id, { stage: 'proposal' })
    expect(useDealsStore.getState().deals[0].probability).toBe(50)
  })

  it('updateDeal closed_won sets probability to 100', async () => {
    const deal = makeDeal()
    await useDealsStore.getState().addDeal(deal)
    await useDealsStore.getState().updateDeal(deal.id, { stage: 'closed_won' })
    expect(useDealsStore.getState().deals[0].probability).toBe(100)
  })

  it('deleteDeal removes the deal', async () => {
    const deal = makeDeal()
    await useDealsStore.getState().addDeal(deal)
    await useDealsStore.getState().deleteDeal(deal.id)
    expect(useDealsStore.getState().deals).toHaveLength(0)
  })

  it('batchAddDeals appends multiple deals', async () => {
    await useDealsStore.getState().batchAddDeals([makeDeal(), makeDeal()])
    expect(useDealsStore.getState().deals).toHaveLength(2)
  })

  it('updateDeal closed_won pushes won activity', async () => {
    const deal = makeDeal({ title: 'Mega Deal' })
    await useDealsStore.getState().addDeal(deal)
    await useDealsStore.getState().updateDeal(deal.id, { stage: 'closed_won' })
    const recent = useActivityStore.getState().dashboard.recent
    expect(recent[0].message).toContain('Won deal')
  })
})
