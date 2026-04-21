'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Contact } from '@/lib/ipc'
import { validateContact, isValidEmail, isValidName, isValidPhone } from '@/lib/validation'
import { formatDate, ITEMS_PER_PAGE } from '@/lib/constants'
import { Pagination } from '@/components/ui/Pagination'

export function ContactsPage() {
  const { contacts, companies, notes, emails, settings, addContact, updateContact, deleteContact, addNote, deleteNote, addEmail } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([])
  const [newNote, setNewNote] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_id: '',
    status: 'lead',
    tags: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateContact({ name: formData.name, email: formData.email, phone: formData.phone })
    if (errors.length > 0) {
      setValidationErrors(Object.fromEntries(errors.map(e => [e.field, e.message])))
      return
    }
    setValidationErrors({})
    const now = new Date().toISOString()
    if (editingId) {
      await updateContact(editingId, formData)
      setEditingId(null)
    } else {
      await addContact({
        id: crypto.randomUUID(),
        ...formData,
        company_id: formData.company_id || undefined,
        created_at: now,
        updated_at: now,
      })
    }
    setFormData({ name: '', email: '', phone: '', company_id: '', status: 'lead', tags: [] })
    setShowForm(false)
  }

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company_id: contact.company_id || '',
      status: contact.status,
      tags: contact.tags || [],
    })
    setEditingId(contact.id)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setFormData({ name: '', email: '', phone: '', company_id: '', status: 'lead', tags: [] })
    setEditingId(null)
    setShowForm(false)
  }

  const toggleSelectForMerge = (id: string) => {
    setSelectedForMerge(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleMergeContacts = async () => {
    if (selectedForMerge.length < 2) return
    
    const primary = contacts.find(c => c.id === selectedForMerge[0])
    const secondaryContacts = selectedForMerge.slice(1).map(id => contacts.find(c => c.id === id)).filter(Boolean)
    
    if (!primary) return
    
    const mergedTags = [...new Set([...primary.tags, ...secondaryContacts.flatMap(c => c?.tags || [])])]
    const mergedPhone = primary.phone || secondaryContacts.find(c => c?.phone)?.phone || ''
    const mergedCompany = primary.company_id || secondaryContacts.find(c => c?.company_id)?.company_id
    const mergedStatus = primary.status === 'customer' ? 'customer' : secondaryContacts.find(c => c?.status === 'customer') ? 'customer' : primary.status

    await updateContact(primary.id, {
      tags: mergedTags,
      phone: mergedPhone,
      company_id: mergedCompany,
      status: mergedStatus,
    })

    for (const contact of secondaryContacts) {
      if (contact) {
        await deleteContact(contact.id)
      }
    }

    setSelectedForMerge([])
    setMergeMode(false)
  }

  const handleAddNote = async () => {
    if (!selectedContact || !newNote.trim()) return
    const now = new Date().toISOString()
    await addNote({
      id: crypto.randomUUID(),
      contact_id: selectedContact.id,
      content: newNote,
      created_at: now,
      updated_at: now,
    })
    setNewNote('')
  }

  const handleSendEmail = async () => {
    if (!selectedContact || !emailForm.subject.trim() || !emailForm.body.trim()) return
    const now = new Date().toISOString()
    await addEmail({
      id: crypto.randomUUID(),
      contact_id: selectedContact.id,
      subject: emailForm.subject,
      body: emailForm.body,
      direction: 'outbound',
      created_at: now,
    })
    setEmailForm({ subject: '', body: '' })
    setShowEmailForm(false)
  }

  const toggleTag = (tag: string) => {
    const tags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag]
    setFormData({ ...formData, tags })
  }

  const getCompanyName = (id?: string) => {
    if (!id) return ''
    const company = companies.find(c => c.id === id)
    return company?.name || ''
  }

  const getContactNotes = (contactId: string) => notes.filter(n => n.contact_id === contactId)
  const getContactEmails = (contactId: string) => emails.filter(e => e.contact_id === contactId)

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    getCompanyName(c.company_id).toLowerCase().includes(search.toLowerCase())
  )
  useEffect(() => setCurrentPage(1), [search])
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const statusColors: Record<string, string> = {
    lead: 'text-text-secondary',
    customer: 'text-brand',
    inactive: 'text-text-muted',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Contacts</h1>
          <p className="text-text-secondary mt-2">Manage your contacts and leads</p>
        </div>
        <div className="flex gap-2">
          {mergeMode && selectedForMerge.length >= 2 && (
            <Button onClick={handleMergeContacts}>Merge ({selectedForMerge.length})</Button>
          )}
          <Button variant={mergeMode ? 'primary' : 'secondary'} onClick={() => { setMergeMode(!mergeMode); setSelectedForMerge([]) }}>
            {mergeMode ? 'Done' : 'Merge'}
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Contact'}
          </Button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search contacts..."
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
                <label className="block text-text-muted text-sm mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full bg-bg-deep border rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none ${validationErrors.name ? 'border-red-500' : 'border-border-base'}`}
                />
                {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-bg-deep border rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none ${validationErrors.email ? 'border-red-500' : 'border-border-base'}`}
                />
                {validationErrors.email && <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>}
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
              <div>
                <label className="block text-text-muted text-sm mb-1">Company</label>
                <select
                  value={formData.company_id}
                  onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  <option value="">Select company</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none"
                >
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-text-muted text-sm mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {settings.tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-1 rounded-sm text-xs border ${
                        formData.tags.includes(tag)
                          ? 'bg-brand/20 border-brand text-brand'
                          : 'border-border-base text-text-muted hover:border-brand'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update Contact' : 'Save Contact'}</Button>
              {editingId && <Button type="button" variant="ghost" onClick={cancelEdit}>Cancel</Button>}
            </div>
          </form>
        </Card>
      )}

      {filteredContacts.length === 0 ? (
        <Card>
          <p className="text-text-muted text-center py-8">
            {search ? `No contacts found matching "${search}"` : 'No contacts yet. Add your first contact to get started.'}
          </p>
        </Card>
      ) : (
        <>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredContacts.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
          <div className="grid gap-4">
            {paginatedContacts.map(contact => {
            const companyName = getCompanyName(contact.company_id)
            const isSelected = selectedForMerge.includes(contact.id)
            return (
              <Card key={contact.id} className={`flex items-center justify-between ${mergeMode && isSelected ? 'border-brand' : ''}`}>
                <div className="flex items-center gap-4">
                  {mergeMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectForMerge(contact.id)}
                      className="w-4 h-4 accent-brand"
                    />
                  )}
                  <button onClick={() => setSelectedContact(contact)} className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center hover:opacity-80 transition-opacity">
                    <span className="text-brand font-medium">{contact.name.charAt(0).toUpperCase()}</span>
                  </button>
                  <div>
                    <p className="text-text-primary font-medium">{contact.name}</p>
                    <p className="text-text-muted text-sm">{contact.email} {companyName && `· ${companyName}`}</p>
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {contact.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-brand/10 text-brand text-xs rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {!mergeMode && (
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[contact.status]}>{contact.status}</Badge>
                    <button onClick={() => handleEdit(contact)} className="text-text-muted hover:text-brand transition-colors">Edit</button>
                    <button onClick={() => deleteContact(contact.id)} className="text-text-muted hover:text-red-500 transition-colors">Delete</button>
                  </div>
                )}
              </Card>
            )
          })}
          </div>
        </>
      )}

      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedContact(null)}>
          <div className="bg-bg border border-border-base rounded-card p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
                  <span className="text-brand font-medium text-lg">{selectedContact.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-text-primary font-medium text-lg">{selectedContact.name}</h2>
                  <Badge className={statusColors[selectedContact.status]}>{selectedContact.status}</Badge>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="text-text-muted hover:text-text-primary">×</button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider">Email</p>
                <p className="text-text-primary">{selectedContact.email}</p>
              </div>
              {selectedContact.phone && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider">Phone</p>
                  <p className="text-text-primary">{selectedContact.phone}</p>
                </div>
              )}
              {selectedContact.company_id && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider">Company</p>
                  <p className="text-text-primary">{getCompanyName(selectedContact.company_id)}</p>
                </div>
              )}
              {selectedContact.tags && selectedContact.tags.length > 0 && (
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider">Tags</p>
                  <div className="flex gap-1 mt-1">
                    {selectedContact.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-brand/10 text-brand text-xs rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <Button onClick={() => setShowEmailForm(!showEmailForm)} className="flex-1">Send Email</Button>
            </div>

            {showEmailForm && (
              <Card className="mb-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={emailForm.subject}
                    onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                    className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary"
                  />
                  <textarea
                    placeholder="Message"
                    rows={4}
                    value={emailForm.body}
                    onChange={e => setEmailForm({ ...emailForm, body: e.target.value })}
                    className="w-full bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary"
                  />
                  <Button onClick={handleSendEmail}>Send</Button>
                </div>
              </Card>
            )}

            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-text-primary font-medium mb-3">Emails ({getContactEmails(selectedContact.id).length})</h3>
              <div className="space-y-2 mb-4">
                {getContactEmails(selectedContact.id).slice(0, 3).map(email => (
                  <div key={email.id} className="bg-bg-deep rounded-sm p-3">
                    <p className="text-text-primary text-sm font-medium">{email.subject}</p>
                    <p className="text-text-muted text-xs mt-1">{new Date(email.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border-subtle pt-4">
              <h3 className="text-text-primary font-medium mb-3">Notes ({getContactNotes(selectedContact.id).length})</h3>
              
              <div className="space-y-2 mb-4">
                {getContactNotes(selectedContact.id).map(note => (
                  <div key={note.id} className="bg-bg-deep rounded-sm p-3">
                    <p className="text-text-primary text-sm">{note.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-text-muted text-xs">{new Date(note.created_at).toLocaleDateString()}</p>
                      <button onClick={() => deleteNote(note.id)} className="text-text-muted hover:text-red-500 text-xs">Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  className="flex-1 bg-bg-deep border border-border-base rounded-sm px-3 py-2 text-text-primary placeholder:text-text-muted focus:border-brand-border focus:outline-none text-sm"
                />
                <Button onClick={handleAddNote}>Add</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}