'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DEAL_STAGES, STAGE_PROBABILITIES, STAGE_COLORS, formatDate, formatCurrency, ITEMS_PER_PAGE } from '@/lib/constants'
import { validateDeal } from '@/lib/validation'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DealsKanban } from '@/components/dashboard/DealsKanban'
import { DealDetailModal } from '@/components/dashboard/DealDetailModal'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DealCardProps {
  deal: { id: string; title: string; value: number; stage: string; probability: number; contact_id: string; created_at: string }
  onMove: (id: string, updates: { stage: string }) => void
  onDelete: (id: string) => void
  getContactName: (id: string) => string
}

function DealCard({ deal, onMove, onDelete, getContactName }: DealCardProps) {
  const weightedValue = Math.round(deal.value * (deal.probability / 100))
  return (
    <div className={`bg-bg border-l-4 ${STAGE_COLORS[deal.stage]?.border || 'border-text-muted'} ${STAGE_COLORS[deal.stage]?.bg || 'bg-text-muted/10'} rounded-[6px] p-3 mb-2`}>
      <p className="text-text-primary text-sm">{deal.title}</p>
      <p className="text-text-muted text-xs mt-1">
        {deal.contact_id && getContactName(deal.contact_id)}
      </p>
      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-text-primary text-sm">${deal.value.toLocaleString()}</span>
          <span className="text-text-muted text-xs ml-2">({deal.probability}% → ${weightedValue.toLocaleString()})</span>
        </div>
        <div className="flex gap-1">
          <select
            value={deal.stage}
            onChange={e => onMove(deal.id, { stage: e.target.value })}
            className="bg-bg-deep border border-border-base rounded-[6px] px-1 py-0.5 text-[10px] text-text-primary"
            onClick={e => e.stopPropagation()}
          >
            {DEAL_STAGES.map(stage => (
              <option key={stage} value={stage}>{stage.replace('_', ' ')}</option>
            ))}
          </select>
          <button
            aria-label={`Remove deal: ${deal.title}`}
            onClick={() => onDelete(deal.id)}
            className="text-text-muted hover:text-[hsl(348,75%,58%)] transition-colors text-xs"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export function DealsPage() {
  const { deals, contacts, companies, tasks, addDeal, updateDeal, deleteDeal, addTask } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [selectedDeal, setSelectedDeal] = useState<typeof deals[0] | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', due_date: '', description: '' })

  const [formData, setFormData] = useState({
    title: '',
    value: 0,
    stage: 'lead',
    probability: 10,
    contact_id: '',
    company_id: '',
    expected_close_date: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateDeal({ title: formData.title, value: formData.value })
    if (errors.length > 0) {
      setValidationErrors(Object.fromEntries(errors.map(e => [e.field, e.message])))
      return
    }
    setValidationErrors({})
    const now = new Date().toISOString()
    await addDeal({
      id: crypto.randomUUID(),
      ...formData,
      company_id: formData.company_id || undefined,
      created_at: now,
      updated_at: now,
    })
    setFormData({ title: '', value: 0, stage: 'lead', probability: 10, contact_id: '', company_id: '', expected_close_date: '' })
    setShowForm(false)
  }

  const handleAddTask = async () => {
    if (!selectedDeal || !taskForm.title) return
    const now = new Date().toISOString()
    await addTask({
      id: crypto.randomUUID(),
      deal_id: selectedDeal.id,
      contact_id: selectedDeal.contact_id,
      company_id: selectedDeal.company_id,
      title: taskForm.title,
      description: taskForm.description,
      status: 'todo',
      due_date: taskForm.due_date,
      created_at: now,
      updated_at: now,
    })
    setTaskForm({ title: '', due_date: '', description: '' })
    setShowTaskForm(false)
  }

  const handleStageChange = async (dealId: string, stage: string) => {
    const probability = STAGE_PROBABILITIES[stage] ?? 10
    await updateDeal(dealId, { stage, probability })
  }

  const getContactName = (id: string) => {
    const contact = contacts.find(c => c.id === id)
    return contact?.name || 'Unknown'
  }

  const filteredDeals = deals.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    getContactName(d.contact_id).toLowerCase().includes(search.toLowerCase())
  )
  useEffect(() => setCurrentPage(1), [search])
  const paginatedDeals = filteredDeals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
          <div className="flex bg-bg-deep border border-border-base rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'list' ? "bg-bg shadow-sm text-brand" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === 'board' ? "bg-bg shadow-sm text-brand" : "text-text-muted hover:text-text-secondary"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
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
          className="w-full bg-bg-deep border border-border-base rounded-[6px] px-4 py-2 pl-10 text-text-primary placeholder:text-text-muted focus:border-brand-border focus:outline-none"
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
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
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
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Stage</label>
                <select
                  value={formData.stage}
                  onChange={e => setFormData({ ...formData, stage: e.target.value, probability: STAGE_PROBABILITIES[e.target.value] || 10 })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  {DEAL_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Probability ({formData.probability}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.probability}
                  onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })}
                  className="w-full h-2 bg-bg-deep rounded-lg appearance-none cursor-pointer accent-brand mt-4"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Contact</label>
                <select
                  value={formData.contact_id}
                  onChange={e => setFormData({ ...formData, contact_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  <option value="">Select contact</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Company</label>
                <select
                  value={formData.company_id}
                  onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  <option value="">Select company</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Expected Close Date</label>
                <input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={e => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
            </div>
            <Button type="submit">Save Deal</Button>
          </form>
        </Card>
      )}
      {viewMode === 'board' ? (
        <DealsKanban onDealClick={setSelectedDeal} />
      ) : filteredDeals.length === 0 ? (
        <Card>
          <p className="text-text-muted text-center py-8">
            {search ? `No deals found matching "${search}"` : 'No deals yet. Add your first deal to get started.'}
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedDeals.map(deal => (
            <Card key={deal.id} onClick={() => setSelectedDeal(deal)} className="cursor-pointer hover:border-brand-border transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary text-lg">{deal.title}</p>
                  <p className="text-text-muted text-sm">
                    {deal.contact_id && getContactName(deal.contact_id)} · {formatDate(deal.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-6" onClick={e => e.stopPropagation()}>
                  <div className="text-right">
                    <p className="text-text-primary">${deal.value.toLocaleString()}</p>
                    <Badge>{deal.stage.replace('_', ' ')}</Badge>
                  </div>
                  <select
                    value={deal.stage}
                    onChange={e => handleStageChange(deal.id, e.target.value)}
                    className="bg-bg-deep border border-border-base rounded-[6px] px-2 py-1 text-text-primary text-sm"
                  >
                    {DEAL_STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage.replace('_', ' ')}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setConfirmDelete(deal.id)}
                    className="text-text-muted hover:text-[hsl(348,75%,58%)] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredDeals.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={updateDeal}
          addTask={addTask}
          contacts={contacts}
          companies={companies}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this deal? This cannot be undone."
          onConfirm={() => { deleteDeal(confirmDelete); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
