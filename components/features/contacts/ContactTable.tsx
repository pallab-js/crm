import { memo } from 'react'
import { Contact } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ITEMS_PER_PAGE } from '@/lib/constants'

const STATUS_COLORS: Record<string, string> = {
  lead: 'text-text-secondary',
  customer: 'text-brand',
  inactive: 'text-text-muted',
}

interface Props {
  contacts: Contact[]
  currentPage: number
  onPageChange: (p: number) => void
  mergeMode: boolean
  selectedForMerge: string[]
  onToggleMerge: (id: string) => void
  onSelect: (c: Contact) => void
  onEdit: (c: Contact) => void
  onDelete: (id: string) => void
  getCompanyName: (id?: string) => string
  search: string
}

export const ContactTable = memo(function ContactTable({
  contacts, currentPage, onPageChange, mergeMode, selectedForMerge,
  onToggleMerge, onSelect, onEdit, onDelete, getCompanyName, search,
}: Props) {
  const paginated = contacts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (contacts.length === 0) {
    return (
      <Card>
        <p className="text-text-muted text-center py-8">
          {search ? `No contacts found matching "${search}"` : 'No contacts yet. Add your first contact to get started.'}
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {paginated.map(contact => {
          const isSelected = selectedForMerge.includes(contact.id)
          return (
            <Card key={contact.id} className={`flex items-center justify-between ${mergeMode && isSelected ? 'border-brand' : ''}`}>
              <div className="flex items-center gap-4">
                {mergeMode && (
                  <input type="checkbox" checked={isSelected} onChange={() => onToggleMerge(contact.id)} className="w-4 h-4 accent-brand" />
                )}
                <button onClick={() => onSelect(contact)} className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center hover:opacity-80 transition-opacity">
                  <span className="text-brand font-medium">{contact.name.charAt(0).toUpperCase()}</span>
                </button>
                <div>
                  <p className="text-text-primary">{contact.name}</p>
                  <p className="text-text-muted text-sm">{contact.email}{getCompanyName(contact.company_id) && ` · ${getCompanyName(contact.company_id)}`}</p>
                  {contact.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {contact.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 bg-brand/10 text-brand text-xs rounded">{tag}</span>)}
                    </div>
                  )}
                </div>
              </div>
              {!mergeMode && (
                <div className="flex items-center gap-4">
                  <Badge className={STATUS_COLORS[contact.status]}>{contact.status}</Badge>
                  <button onClick={() => onEdit(contact)} className="text-text-muted hover:text-brand transition-colors">Edit</button>
                  <button onClick={() => onDelete(contact.id)} className="text-text-muted hover:text-[hsl(348,75%,58%)] transition-colors">Delete</button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
      <Pagination currentPage={currentPage} totalItems={contacts.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={onPageChange} />
    </>
  )
})
