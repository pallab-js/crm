'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Deal } from '@/lib/ipc'
import { validateDeal } from '@/lib/validation'
import { STAGE_PROBABILITIES } from '@/lib/constants'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Card } from '@/components/ui/Card'
import { DealsKanban } from '@/components/dashboard/DealsKanban'
import { DealDetailModal } from '@/components/dashboard/DealDetailModal'
import { DealFilters } from '@/components/features/deals/DealFilters'
import { DealForm, DealFormData } from '@/components/features/deals/DealForm'
import { DealTable } from '@/components/features/deals/DealTable'

const EMPTY_FORM: DealFormData = { title: '', value: 0, stage: 'lead', probability: 10, contact_id: '', company_id: '', expected_close_date: '' }

export function DealsPage() {
  const { deals, contacts, companies, addDeal, updateDeal, deleteDeal, addTask } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<DealFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const getContactName = useCallback((id: string) => contacts.find(c => c.id === id)?.name ?? 'Unknown', [contacts])

  const filteredDeals = useMemo(() =>
    deals.filter(d =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      getContactName(d.contact_id).toLowerCase().includes(search.toLowerCase())
    ), [deals, search, getContactName])

  useEffect(() => setCurrentPage(1), [search])

  const totalValue = useMemo(() => deals.reduce((s, d) => s + d.value, 0), [deals])
  const weightedValue = useMemo(() => deals.reduce((s, d) => s + d.value * (d.probability / 100), 0), [deals])
  const wonValue = useMemo(() => deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0), [deals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateDeal({ title: formData.title, value: formData.value })
    if (errs.length > 0) { setErrors(Object.fromEntries(errs.map(e => [e.field, e.message]))); return }
    setErrors({})
    const now = new Date().toISOString()
    await addDeal({ id: crypto.randomUUID(), ...formData, company_id: formData.company_id || undefined, created_at: now, updated_at: now })
    setFormData(EMPTY_FORM)
    setShowForm(false)
  }

  const handleStageChange = useCallback(async (id: string, stage: string) => {
    await updateDeal(id, { stage, probability: STAGE_PROBABILITIES[stage] ?? 10 })
  }, [updateDeal])

  return (
    <div className="space-y-6">
      <DealFilters search={search} onSearchChange={setSearch} viewMode={viewMode} onViewModeChange={setViewMode} showForm={showForm} onToggleForm={() => setShowForm(!showForm)} />

      <div className="grid grid-cols-4 gap-4">
        <Card><p className="text-text-muted text-sm">Total Pipeline</p><p className="text-[36px] text-text-primary">${totalValue.toLocaleString()}</p></Card>
        <Card><p className="text-text-muted text-sm">Weighted Value</p><p className="text-[36px] text-brand">${Math.round(weightedValue).toLocaleString()}</p></Card>
        <Card><p className="text-text-muted text-sm">Won</p><p className="text-[36px] text-brand">${wonValue.toLocaleString()}</p></Card>
        <Card><p className="text-text-muted text-sm">Deals</p><p className="text-[36px] text-text-primary">{deals.length}</p></Card>
      </div>

      {showForm && <DealForm data={formData} onChange={setFormData} onSubmit={handleSubmit} errors={errors} contacts={contacts} companies={companies} />}

      {viewMode === 'board' ? (
        <DealsKanban onDealClick={setSelectedDeal} />
      ) : (
        <DealTable deals={filteredDeals} currentPage={currentPage} onPageChange={setCurrentPage}
          onSelect={setSelectedDeal} onStageChange={handleStageChange} onDelete={setConfirmDelete}
          getContactName={getContactName} search={search} />
      )}

      {selectedDeal && <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} onUpdate={updateDeal} addTask={addTask} contacts={contacts} companies={companies} />}

      {confirmDelete && (
        <ConfirmDialog message="Delete this deal? This cannot be undone."
          onConfirm={() => { deleteDeal(confirmDelete); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  )
}
