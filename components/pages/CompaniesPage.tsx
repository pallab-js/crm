'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function CompaniesPage() {
  const { companies, contacts, deals, addCompany, updateCompany, deleteCompany } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    industry: '',
    phone: '',
    address: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const getCompanyStats = (companyId: string) => {
    const companyContacts = contacts.filter(c => c.company_id === companyId)
    const companyDeals = deals.filter(d => d.company_id === companyId)
    return { contacts: companyContacts.length, deals: companyDeals.length, revenue: companyDeals.reduce((sum, d) => sum + d.value, 0) }
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.domain.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
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
                <label className="block text-text-muted text-sm mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Domain</label>
                <input
                  type="text"
                  placeholder="example.com"
                  value={formData.domain}
                  onChange={e => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-text-muted text-sm mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
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
        <div className="grid gap-4">
          {filteredCompanies.map(company => {
            const stats = getCompanyStats(company.id)
            return (
              <Card key={company.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-brand/20 flex items-center justify-center">
                    <span className="text-brand font-medium text-lg">{company.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-text-primary font-medium text-lg">{company.name}</p>
                    <p className="text-text-muted text-sm">{company.domain} {company.industry && `· ${company.industry}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-text-primary font-medium">{stats.contacts}</p>
                      <p className="text-text-muted text-xs">Contacts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-text-primary font-medium">{stats.deals}</p>
                      <p className="text-text-muted text-xs">Deals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-brand font-medium">${stats.revenue.toLocaleString()}</p>
                      <p className="text-text-muted text-xs">Revenue</p>
                    </div>
                  </div>
                  <button onClick={() => handleEdit(company)} className="text-text-muted hover:text-brand transition-colors">Edit</button>
                  <button onClick={() => deleteCompany(company.id)} className="text-text-muted hover:text-red-500 transition-colors">Delete</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}