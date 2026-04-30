'use client'
import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Company, Contact } from '@/lib/ipc'
import { validateCompany } from '@/lib/validation'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import { Pagination } from '@/components/ui/Pagination'
import { ActivityTimeline } from '@/components/ui/ActivityTimeline'

export function CompaniesPage() {
  const { companies, contacts, deals, tasks, addCompany, updateCompany, deleteCompany, addContact, addTask, addDeal } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  
  const [showContactForm, setShowContactForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showDealForm, setShowDealForm] = useState(false)
  
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', status: 'lead' })
  const [taskForm, setTaskForm] = useState({ title: '', due_date: '', description: '' })
  const [dealForm, setDealForm] = useState({ title: '', value: '', stage: 'lead' })

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    phone: '',
    address: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateCompany({ name: formData.name, domain: formData.domain })
    if (errors.length > 0) {
      setValidationErrors(Object.fromEntries(errors.map(err => [err.field, err.message])))
      return
    }
    setValidationErrors({})
    const now = new Date().toISOString()
    if (editingId) {
      await updateCompany(editingId, formData)
      setEditingId(null)
    } else {
      await addCompany({
        id: crypto.randomUUID(),
        ...formData,
        created_at: now,
        updated_at: now,
      })
    }
    setFormData({ name: '', domain: '', industry: '', phone: '', address: '' })
    setShowForm(false)
  }

  const handleEdit = (company: typeof companies[0]) => {
    setFormData({
      name: company.name,
      domain: company.domain,
      industry: company.industry,
      phone: company.phone,
      address: company.address,
    })
    setEditingId(company.id)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setFormData({ name: '', domain: '', industry: '', phone: '', address: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleAddContact = async () => {
    if (!selectedCompany || !contactForm.name || !contactForm.email) return
    const now = new Date().toISOString()
    await addContact({
      id: crypto.randomUUID(),
      company_id: selectedCompany.id,
      ...contactForm,
      tags: [],
      created_at: now,
      updated_at: now,
    })
    setContactForm({ name: '', email: '', phone: '', status: 'lead' })
    setShowContactForm(false)
  }

  const handleAddTask = async () => {
    if (!selectedCompany || !taskForm.title) return
    const now = new Date().toISOString()
    await addTask({
      id: crypto.randomUUID(),
      company_id: selectedCompany.id,
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

  const handleAddDeal = async () => {
    if (!selectedCompany || !dealForm.title || !dealForm.value) return
    const now = new Date().toISOString()
    await addDeal({
      id: crypto.randomUUID(),
      company_id: selectedCompany.id,
      contact_id: '', // optional but usually required in DealsPage
      title: dealForm.title,
      value: parseFloat(dealForm.value) || 0,
      stage: dealForm.stage,
      probability: 10,
      created_at: now,
      updated_at: now,
    })
    setDealForm({ title: '', value: '', stage: 'lead' })
    setShowDealForm(false)
  }

  const getCompanyStats = (companyId: string) => {
    const companyContacts = contacts.filter(c => c.company_id === companyId)
    const companyDeals = deals.filter(d => d.company_id === companyId)
    return { contacts: companyContacts.length, deals: companyDeals.length, revenue: companyDeals.reduce((sum, d) => sum + d.value, 0) }
  }

  const filteredCompanies = useMemo(() => companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.domain.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  ), [companies, search])

  useEffect(() => setCurrentPage(1), [search])
  const paginatedCompanies = useMemo(() => 
    filteredCompanies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredCompanies, currentPage]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Companies</h1>
          <p className="text-text-secondary mt-2">Manage your companies and accounts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Company'}
        </Button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search companies..."
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
                <label className="block text-text-muted text-sm mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-bg-deep border rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none ${validationErrors.name ? 'border-[hsl(348,75%,58%)]' : 'border-border-base'}`}
                />
                {validationErrors.name && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{validationErrors.name}</p>}
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Domain</label>
                <input
                  type="text"
                  placeholder="example.com"
                  value={formData.domain}
                  onChange={e => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-text-muted text-sm mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update Company' : 'Save Company'}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button>}
            </div>
          </form>
        </Card>
      )}

      {filteredCompanies.length === 0 ? (
        <Card>
          <p className="text-text-muted text-center py-8">
            {search ? `No companies found matching "${search}"` : 'No companies yet. Add your first company to get started.'}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedCompanies.map(company => {
              const stats = getCompanyStats(company.id)
              return (
                <Card key={company.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedCompany(company)} className="w-12 h-12 rounded bg-brand/20 flex items-center justify-center hover:opacity-80 transition-opacity">
                      <span className="text-brand font-medium text-lg">{company.name.charAt(0).toUpperCase()}</span>
                    </button>
                    <div>
                      <p className="text-text-primary text-lg">{company.name}</p>
                      <p className="text-text-muted text-sm">{company.domain} {company.industry && `· ${company.industry}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-text-primary">{stats.contacts}</p>
                        <p className="text-text-muted text-xs">Contacts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-text-primary">{stats.deals}</p>
                        <p className="text-text-muted text-xs">Deals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-brand">${stats.revenue.toLocaleString()}</p>
                        <p className="text-text-muted text-xs">Revenue</p>
                      </div>
                    </div>
                    <button onClick={() => handleEdit(company)} className="text-text-muted hover:text-brand transition-colors">Edit</button>
                    <button onClick={() => setConfirmDelete(company.id)} className="text-text-muted hover:text-[hsl(348,75%,58%)] transition-colors">Delete</button>
                  </div>
                </Card>
              )
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredCompanies.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedCompany(null)}
          onKeyDown={e => e.key === 'Escape' && setSelectedCompany(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Company: ${selectedCompany.name}`}
            className="bg-bg border border-border-base rounded-[8px] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded bg-brand/20 flex items-center justify-center">
                  <span className="text-brand font-medium text-2xl">{selectedCompany.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-text-primary text-2xl">{selectedCompany.name}</h2>
                  <p className="text-text-secondary">{selectedCompany.domain}</p>
                </div>
              </div>
              <button aria-label="Close" onClick={() => setSelectedCompany(null)} className="text-text-muted hover:text-text-primary text-2xl">×</button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold">Details</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Industry</span>
                    <span className="text-text-primary">{selectedCompany.industry || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Phone</span>
                    <span className="text-text-primary">{selectedCompany.phone || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Address</span>
                    <span className="text-text-primary">{selectedCompany.address || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold">Performance</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-3 text-center bg-bg-deep border-none">
                    <p className="text-text-primary font-bold">{getCompanyStats(selectedCompany.id).contacts}</p>
                    <p className="text-text-muted text-[10px] uppercase">People</p>
                  </Card>
                  <Card className="p-3 text-center bg-bg-deep border-none">
                    <p className="text-text-primary font-bold">{getCompanyStats(selectedCompany.id).deals}</p>
                    <p className="text-text-muted text-[10px] uppercase">Deals</p>
                  </Card>
                  <Card className="p-3 text-center bg-bg-deep border-none">
                    <p className="text-brand font-bold">${getCompanyStats(selectedCompany.id).revenue.toLocaleString()}</p>
                    <p className="text-text-muted text-[10px] uppercase">Rev</p>
                  </Card>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Button onClick={() => setShowContactForm(!showContactForm)} className="flex-1" variant={showContactForm ? 'secondary' : 'primary'}>Add Person</Button>
              <Button onClick={() => setShowTaskForm(!showTaskForm)} className="flex-1" variant={showTaskForm ? 'secondary' : 'primary'}>Add Task</Button>
              <Button onClick={() => setShowDealForm(!showDealForm)} className="flex-1" variant={showDealForm ? 'secondary' : 'primary'}>Add Deal</Button>
            </div>

            {showContactForm && (
              <Card className="mb-6 bg-bg-deep border-brand/20">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">New Contact for {selectedCompany.name}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddContact} className="flex-1">Create Contact</Button>
                    <Button onClick={() => setShowContactForm(false)} variant="ghost">Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            {showTaskForm && (
              <Card className="mb-6 bg-bg-deep border-brand/20">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">New Task for {selectedCompany.name}</h4>
                  <input
                    type="text"
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                  />
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddTask} className="flex-1">Create Task</Button>
                    <Button onClick={() => setShowTaskForm(false)} variant="ghost">Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            {showDealForm && (
              <Card className="mb-6 bg-bg-deep border-brand/20">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">New Deal for {selectedCompany.name}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Deal title"
                      value={dealForm.title}
                      onChange={e => setDealForm({ ...dealForm, title: e.target.value })}
                      className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Value ($)"
                      value={dealForm.value}
                      onChange={e => setDealForm({ ...dealForm, value: e.target.value })}
                      className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddDeal} className="flex-1">Create Deal</Button>
                    <Button onClick={() => setShowDealForm(false)} variant="ghost">Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="border-t border-border-subtle pt-6">
              <h3 className="text-text-primary font-semibold mb-4">Company Activity Feed</h3>
              <ActivityTimeline companyId={selectedCompany.id} />
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this company? This cannot be undone."
          onConfirm={() => { deleteCompany(confirmDelete); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
