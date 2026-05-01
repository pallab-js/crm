import { memo } from 'react'
import { Button } from '@/components/ui/Button'
import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  viewMode: 'list' | 'board'
  onViewModeChange: (m: 'list' | 'board') => void
  showForm: boolean
  onToggleForm: () => void
}

export const DealFilters = memo(function DealFilters({ search, onSearchChange, viewMode, onViewModeChange, showForm, onToggleForm }: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Deals</h1>
          <p className="text-text-secondary mt-2">Track your sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-bg-deep border border-border-base rounded-lg p-1">
            <button onClick={() => onViewModeChange('list')} className={cn('p-1.5 rounded-md transition-all', viewMode === 'list' ? 'bg-bg shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary')}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => onViewModeChange('board')} className={cn('p-1.5 rounded-md transition-all', viewMode === 'board' ? 'bg-bg shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={onToggleForm}>{showForm ? 'Cancel' : 'Add Deal'}</Button>
        </div>
      </div>
      <div className="relative">
        <input type="text" placeholder="Search deals..." value={search} onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-bg-deep border border-border-base rounded-[6px] px-4 py-2 pl-10 text-text-primary placeholder:text-text-muted focus:border-brand-border focus:outline-none" />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </>
  )
})
