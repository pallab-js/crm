import { memo } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  mergeMode: boolean
  mergeCount: number
  onToggleMerge: () => void
  onMerge: () => void
  onAddContact: () => void
  showForm: boolean
}

export const ContactFilters = memo(function ContactFilters({
  search, onSearchChange, mergeMode, mergeCount, onToggleMerge, onMerge, onAddContact, showForm,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Contacts</h1>
          <p className="text-text-secondary mt-2">Manage your contacts and leads</p>
        </div>
        <div className="flex gap-2">
          {mergeMode && mergeCount >= 2 && (
            <Button onClick={onMerge}>Merge ({mergeCount})</Button>
          )}
          <Button variant={mergeMode ? 'primary' : 'secondary'} onClick={onToggleMerge}>
            {mergeMode ? 'Done' : 'Merge'}
          </Button>
          <Button onClick={onAddContact}>{showForm ? 'Cancel' : 'Add Contact'}</Button>
        </div>
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-bg-deep border border-border-base rounded-[6px] px-4 py-2 pl-10 text-text-primary placeholder:text-text-muted focus:border-brand-border focus:outline-none"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </>
  )
})
