'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Contact } from '@/lib/ipc'
import { validateContact } from '@/lib/validation'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDebounce } from '@/lib/useDebounce'
import { ContactFilters } from '@/components/features/contacts/ContactFilters'
import { ContactForm, ContactFormData } from '@/components/features/contacts/ContactForm'
import { ContactTable } from '@/components/features/contacts/ContactTable'
import { ContactDetail } from '@/components/features/contacts/ContactDetail'

const EMPTY_FORM: ContactFormData = { name: '', email: '', phone: '', company_id: '', status: 'lead', tags: [] }

export function ContactsPage() {
  const { contacts, companies, settings, addContact, updateContact, deleteContact, addNote, addEmail, addTask, addDeal } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<ContactFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [mergeMode, setMergeMode] = useState(false)
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const getCompanyName = useCallback((id?: string) => companies.find(c => c.id === id)?.name ?? '', [companies])

  const filteredContacts = useMemo(() =>
    contacts.filter(c =>
      c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      getCompanyName(c.company_id).toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [contacts, debouncedSearch, getCompanyName])

  useEffect(() => setCurrentPage(1), [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateContact({ name: formData.name, email: formData.email, phone: formData.phone })
    if (errs.length > 0) { setErrors(Object.fromEntries(errs.map(e => [e.field, e.message]))); return }
    setErrors({})
    const now = new Date().toISOString()
    if (editingId) {
      await updateContact(editingId, formData)
      setEditingId(null)
    } else {
      await addContact({ id: crypto.randomUUID(), ...formData, company_id: formData.company_id || undefined, created_at: now, updated_at: now })
    }
    setFormData(EMPTY_FORM)
    setShowForm(false)
  }

  const handleEdit = useCallback((contact: Contact) => {
    setFormData({ name: contact.name, email: contact.email, phone: contact.phone, company_id: contact.company_id ?? '', status: contact.status, tags: contact.tags ?? [] })
    setEditingId(contact.id)
    setShowForm(true)
  }, [])

  const handleMerge = async () => {
    if (selectedForMerge.length < 2) return
    const primary = contacts.find(c => c.id === selectedForMerge[0])
    if (!primary) return
    const secondaries = selectedForMerge.slice(1).map(id => contacts.find(c => c.id === id)).filter(Boolean) as Contact[]
    await updateContact(primary.id, {
      tags: [...new Set([...primary.tags, ...secondaries.flatMap(c => c.tags)])],
      phone: primary.phone || secondaries.find(c => c.phone)?.phone || '',
      company_id: primary.company_id || secondaries.find(c => c.company_id)?.company_id,
      status: [primary, ...secondaries].some(c => c.status === 'customer') ? 'customer' : primary.status,
    })
    for (const c of secondaries) await deleteContact(c.id)
    setSelectedForMerge([])
    setMergeMode(false)
  }

  const handleAddNote = useCallback(async (content: string) => {
    if (!selectedContact) return
    const now = new Date().toISOString()
    await addNote({ id: crypto.randomUUID(), contact_id: selectedContact.id, content, created_at: now, updated_at: now })
  }, [selectedContact, addNote])

  const handleAddEmail = useCallback(async (subject: string, body: string) => {
    if (!selectedContact) return
    await addEmail({ id: crypto.randomUUID(), contact_id: selectedContact.id, subject, body, direction: 'outbound', created_at: new Date().toISOString() })
  }, [selectedContact, addEmail])

  const handleAddTask = useCallback(async (title: string, due_date: string, description: string) => {
    if (!selectedContact) return
    const now = new Date().toISOString()
    await addTask({ id: crypto.randomUUID(), contact_id: selectedContact.id, title, description, status: 'todo', due_date, created_at: now, updated_at: now })
  }, [selectedContact, addTask])

  const handleAddDeal = useCallback(async (title: string, value: string, stage: string) => {
    if (!selectedContact) return
    const now = new Date().toISOString()
    await addDeal({ id: crypto.randomUUID(), contact_id: selectedContact.id, company_id: selectedContact.company_id, title, value: parseFloat(value) || 0, stage, probability: 10, created_at: now, updated_at: now })
  }, [selectedContact, addDeal])

  return (
    <div className="space-y-6">
      <ContactFilters
        search={search} onSearchChange={setSearch}
        mergeMode={mergeMode} mergeCount={selectedForMerge.length}
        onToggleMerge={() => { setMergeMode(!mergeMode); setSelectedForMerge([]) }}
        onMerge={handleMerge}
        onAddContact={() => setShowForm(!showForm)} showForm={showForm}
      />

      {showForm && (
        <ContactForm
          data={formData} onChange={setFormData} onSubmit={handleSubmit}
          onCancel={() => { setFormData(EMPTY_FORM); setEditingId(null); setShowForm(false) }}
          errors={errors} companies={companies} tags={settings.tags} editingId={editingId}
        />
      )}

      <ContactTable
        contacts={filteredContacts} currentPage={currentPage} onPageChange={setCurrentPage}
        mergeMode={mergeMode} selectedForMerge={selectedForMerge}
        onToggleMerge={id => setSelectedForMerge(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
        onSelect={setSelectedContact} onEdit={handleEdit}
        onDelete={setConfirmDelete} getCompanyName={getCompanyName} search={debouncedSearch}
      />

      {selectedContact && (
        <ContactDetail
          contact={selectedContact} getCompanyName={getCompanyName}
          onClose={() => setSelectedContact(null)}
          onAddNote={handleAddNote} onAddEmail={handleAddEmail}
          onAddTask={handleAddTask} onAddDeal={handleAddDeal}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message="Delete this contact? This cannot be undone."
          onConfirm={() => { deleteContact(confirmDelete); setConfirmDelete(null) }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
