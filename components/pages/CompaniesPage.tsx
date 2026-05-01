'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Company } from '@/lib/ipc'
import { validateCompany } from '@/lib/validation'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { CompanyForm, CompanyFormData } from '@/components/features/companies/CompanyForm'
import { CompanyTable } from '@/components/features/companies/CompanyTable'
import { CompanyDetail } from '@/components/features/companies/CompanyDetail'

const EMPTY_FORM: CompanyFormData = { name: '', domain: '', industry: '', phone: '', address: '' }

export function CompaniesPage() {
  const { companies, contacts, deals, addCompany, updateCompany, deleteCompany, addContact, addTask, addDeal } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<CompanyFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filteredCompanies = useMemo(() =>
    companies.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.domain.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
    ), [companies, search])

  useEffect(() => setCurrentPage(1), [search])

  const getStats = useCallback((id: string) => ({
    contacts: contacts.filter(c => c.company_id === id).length,
    deals: deals.filter(d => d.company_id === id).length,
    revenue: deals.filter(d => d.company_id === id).reduce((s, d) => s + d.value, 0),
  }), [contacts, deals])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateCompany({ name: formData.name, domain: formData.domain })
    if (errs.length > 0) { setErrors(Object.fromEntries(errs.map(e => [e.field, e.message]))); return }
    setErrors({})
    const now = new Date().toISOString()
    if (editingId) { await updateCompany(editingId, formData); setEditingId(null) }
    else await addCompany({ id: crypto.randomUUID(), ...formData, created_at: now, updated_at: now })
    setFormData(EMPTY_FORM)
    setShowForm(false)
  }

  const handleEdit = useCallback((company: Company) => {
    setFormData({ name: company.name, domain: company.domain, industry: company.industry, phone: company.phone, address: company.address })
    setEditingId(company.id)
    setShowForm(true)
  }, [])

  const handleAddContact = useCallback(async (name: string, email: string, phone: string, status: string) => {
    if (!selectedCompany || !name || !email) return
    const now = new Date().toISOString()
    await addContact({ id: crypto.randomUUID(), company_id: selectedCompany.id, name, email, phone, status, tags: [], created_at: now, updated_at: now })
  }, [selectedCompany, addContact])

  const handleAddTask = useCallback(async (title: string, due_date: string, description: string) => {
    if (!selectedCompany || !title) return
    const now = new Date().toISOString()
    await addTask({ id: crypto.randomUUID(), company_id: selectedCompany.id, title, description, status: 'todo', due_date, created_at: now, updated_at: now })
  }, [selectedCompany, addTask])

  const handleAddDeal = useCallback(async (title: string, value: string, stage: string) => {
    if (!selectedCompany || !title || !value) return
    const now = new Date().toISOString()
    await addDeal({ id: crypto.randomUUID(), company_id: selectedCompany.id, contact_id: '', title, value: parseFloat(value) || 0, stage, probability: 10, created_at: now, updated_at: now })
  }, [selectedCompany, addDeal])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Companies</h1>
          <p className="text-text-secondary mt-2">Manage your companies and accounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Company'}</Button>
      </div>

      <div className="relative">
        <input type="text" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-bg-deep border border-border-base rounded-[6px] px-4 py-2 pl-10 text-text-primary placeholder:text-text-muted focus:border-brand-border focus:outline-none" />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {showForm && <CompanyForm data={formData} onChange={setFormData} onSubmit={handleSubmit} onCancel={() => { setFormData(EMPTY_FORM); setEditingId(null); setShowForm(false) }} errors={errors} editingId={editingId} />}

      <CompanyTable companies={filteredCompanies} currentPage={currentPage} onPageChange={setCurrentPage}
        onSelect={setSelectedCompany} onEdit={handleEdit} onDelete={setConfirmDelete} getStats={getStats} search={search} />

      {selectedCompany && (
        <CompanyDetail company={selectedCompany} stats={getStats(selectedCompany.id)}
          onClose={() => setSelectedCompany(null)}
          onAddContact={handleAddContact} onAddTask={handleAddTask} onAddDeal={handleAddDeal} />
      )}

      {confirmDelete && (
        <ConfirmDialog message="Delete this company? This cannot be undone."
          onConfirm={() => { deleteCompany(confirmDelete); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  )
}
