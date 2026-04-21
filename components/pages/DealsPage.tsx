'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

const STAGE_PROBABILITY: Record<string, number> = {
  lead: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0,
}

const stageColors: Record<string, string> = {
  lead: 'border-text-muted',
  qualified: 'border-text-secondary',
  proposal: 'border-blue-400',
  negotiation: 'border-yellow-400',
  closed_won: 'border-brand',
  closed_lost: 'border-red-400',
}

const stageBgColors: Record<string, string> = {
  lead: 'bg-text-muted/10',
  qualified: 'bg-text-secondary/10',
  proposal: 'bg-blue-400/10',
  negotiation: 'bg-yellow-400/10',
  closed_won: 'bg-brand/10',
  closed_lost: 'bg-red-400/10',
}

interface DealCardProps {
  deal: { id: string; title: string; value: number; stage: string; probability: number; contact_id: string; created_at: string }
  onMove: (id: string, updates: { stage: string }) => void
  onDelete: (id: string) => void
  getContactName: (id: string) => string
}

function DealCard({ deal, onMove, onDelete, getContactName }: DealCardProps) {
  const weightedValue = Math.round(deal.value * (deal.probability / 100))
  return (
    <div className={`bg-bg border-l-4 ${stageColors[deal.stage]} ${stageBgColors[deal.stage]} rounded-sm p-3 mb-2`}>
      <p className="text-text-primary font-medium text-sm">{deal.title}</p>
      <p className="text-text-muted text-xs mt-1">
        {deal.contact_id && getContactName(deal.contact_id)}
      </p>
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-text-primary font-medium text-sm">${deal.value.toLocaleString()}</span>
          <span className="text-text-muted text-xs ml-2">({deal.probability}% → ${weightedValue.toLocaleString()})</span>
        </div>
        <div className="flex gap-1">
          <select
            value={deal.stage}
            onChange={e => onMove(deal.id, { stage: e.target.value })}
            className="bg-bg-deep border border-border-base rounded-sm px-1 py-0.5 text-[10px] text-text-primary"
            onClick={e => e.stopPropagation()}
          >
            {DEAL_STAGES.map(stage => (
              <option key={stage} value={stage}>{stage.replace('_', ' ')}</option>
            ))}
          </select>
          <button
            onClick={() => onDelete(deal.id)}
            className="text-text-muted hover:text-red-500 transition-colors text-xs"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export function DealsPage() {
  const { deals, contacts, addDeal, updateDeal, deleteDeal } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [formData, setFormData] = useState({
    title: '',
    value: 0,
    stage: 'lead',
    probability: 10,
    contact_id: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    await addDeal({
      id: crypto.randomUUID(),
      ...formData,
      created_at: now,
      updated_at: now,
    })
    setFormData({ title: '', value: 0, stage: 'lead', probability: 10, contact_id: '' })
    setShowForm(false)
  }

  const getContactName = (id: string) => {
    const contact = contacts.find(c => c.id === id)
    return contact?.name || 'Unknown'
  }

  const filteredDeals = deals.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    getContactName(d.contact_id).toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  const weightedValue = deals.reduce((sum, d) => sum + (d.value * (d.probability || 0) / 100), 0)
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0)

  const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter(d => d.stage === stage)
    return acc
  }, {} as Record<string, typeof deals>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Deals</h1>
          <p className="text-text-secondary mt-2">Track your sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-bg-deep rounded-pill p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-pill text-sm ${viewMode === 'list' ? 'bg-brand text-bg-deep' : 'text-text-muted'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-pill text-sm ${viewMode === 'board' ? 'bg-brand text-bg-deep' : 'text-text-muted'}`}
            >
              Board
            </button>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Deal'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-text-muted text-sm">Total Pipeline</p>
          <p className="text-[36px] text-text-primary">${totalValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Weighted Value</p>
          <p className="text-[36px] text-brand">${weightedValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Won</p>
          <p className="text-[36px] text-brand">${wonValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Deals</p>
          <p className="text-[36px] text-text-primary">{deals.length}</p>
        </Card>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search deals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-bg-deep border border-border-base rounded-sm px-4 py-2 pl-10 text-text-primary placeholder:text-text-muted focus:border-brand-border focus:outline-none"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-text-muted text-sm mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Value ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Stage</label>
                <select
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  {DEAL_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Contact</label>
                <select
                  value={formData.contact_id}
                  onChange={e => setFormData({ ...formData, contact_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  <option value="">Select contact</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit">Save Deal</Button>
          </form>
        </Card>
      )}

      {viewMode === 'board' ? (
        <div className="grid grid-cols-6 gap-3">
          {DEAL_STAGES.map(stage => (
            <div key={stage} className="min-h-[200px]">
              <div className={`text-xs uppercase tracking-wider text-text-muted mb-2 pb-2 border-b ${stageColors[stage]}`}>
                {stage.replace('_', ' ')} ({dealsByStage[stage].length})
              </div>
              <div className="space-y-0">
                {dealsByStage[stage].map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onMove={updateDeal}
                    onDelete={deleteDeal}
                    getContactName={getContactName}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredDeals.length === 0 ? (
        <Card>
          <p className="text-text-muted text-center py-8">
            {search ? `No deals found matching "${search}"` : 'No deals yet. Add your first deal to get started.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDeals.map(deal => (
            <Card key={deal.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium text-lg">{deal.title}</p>
                  <p className="text-text-muted text-sm">
                    {deal.contact_id && getContactName(deal.contact_id)} · {new Date(deal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-text-primary font-medium">${deal.value.toLocaleString()}</p>
                    <Badge>{deal.stage.replace('_', ' ')}</Badge>
                  </div>
                  <select
                    value={deal.stage}
                    onChange={e => updateDeal(deal.id, { stage: e.target.value })}
                    className="bg-bg-deep border border-border-base rounded-sm px-2 py-1 text-text-primary text-sm"
                  >
                    {DEAL_STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage.replace('_', ' ')}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteDeal(deal.id)}
                    className="text-text-muted hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}