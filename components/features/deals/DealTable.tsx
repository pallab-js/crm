import { memo } from 'react'
import { Deal } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { DEAL_STAGES, ITEMS_PER_PAGE, formatDate } from '@/lib/constants'

interface Props {
  deals: Deal[]
  currentPage: number
  onPageChange: (p: number) => void
  onSelect: (d: Deal) => void
  onStageChange: (id: string, stage: string) => void
  onDelete: (id: string) => void
  getContactName: (id: string) => string
  search: string
}

export const DealTable = memo(function DealTable({ deals, currentPage, onPageChange, onSelect, onStageChange, onDelete, getContactName, search }: Props) {
  const paginated = deals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (deals.length === 0) {
    return (
      <Card>
        <p className="text-text-muted text-center py-8">
          {search ? `No deals found matching "${search}"` : 'No deals yet. Add your first deal to get started.'}
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {paginated.map(deal => (
          <Card key={deal.id} onClick={() => onSelect(deal)} className="cursor-pointer hover:border-brand-border transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary text-lg">{deal.title}</p>
                <p className="text-text-muted text-sm">{deal.contact_id && getContactName(deal.contact_id)} · {formatDate(deal.created_at)}</p>
              </div>
              <div className="flex items-center gap-6" onClick={e => e.stopPropagation()}>
                <div className="text-right">
                  <p className="text-text-primary">${deal.value.toLocaleString()}</p>
                  <Badge>{deal.stage.replace('_', ' ')}</Badge>
                </div>
                <select value={deal.stage} onChange={e => onStageChange(deal.id, e.target.value)}
                  className="bg-bg-deep border border-border-base rounded-[6px] px-2 py-1 text-text-primary text-sm">
                  {DEAL_STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <button onClick={() => onDelete(deal.id)} className="text-text-muted hover:text-[hsl(348,75%,58%)] transition-colors">Delete</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Pagination currentPage={currentPage} totalItems={deals.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={onPageChange} />
    </>
  )
})
