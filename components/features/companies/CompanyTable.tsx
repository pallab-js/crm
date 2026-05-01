import { memo } from 'react'
import { Company } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface Props {
  companies: Company[]
  currentPage: number
  onPageChange: (p: number) => void
  onSelect: (c: Company) => void
  onEdit: (c: Company) => void
  onDelete: (id: string) => void
  getStats: (id: string) => { contacts: number; deals: number; revenue: number }
  search: string
}

export const CompanyTable = memo(function CompanyTable({ companies, currentPage, onPageChange, onSelect, onEdit, onDelete, getStats, search }: Props) {
  const paginated = companies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (companies.length === 0) {
    return (
      <Card>
        <p className="text-text-muted text-center py-8">
          {search ? `No companies found matching "${search}"` : 'No companies yet. Add your first company to get started.'}
        </p>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {paginated.map(company => {
          const stats = getStats(company.id)
          return (
            <Card key={company.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => onSelect(company)} className="w-12 h-12 rounded bg-brand/20 flex items-center justify-center hover:opacity-80 transition-opacity">
                  <span className="text-brand font-medium text-lg">{company.name.charAt(0).toUpperCase()}</span>
                </button>
                <div>
                  <p className="text-text-primary text-lg">{company.name}</p>
                  <p className="text-text-muted text-sm">{company.domain}{company.industry && ` · ${company.industry}`}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex gap-4 text-sm">
                  <div className="text-center"><p className="text-text-primary">{stats.contacts}</p><p className="text-text-muted text-xs">Contacts</p></div>
                  <div className="text-center"><p className="text-text-primary">{stats.deals}</p><p className="text-text-muted text-xs">Deals</p></div>
                  <div className="text-center"><p className="text-brand">${stats.revenue.toLocaleString()}</p><p className="text-text-muted text-xs">Revenue</p></div>
                </div>
                <button onClick={() => onEdit(company)} className="text-text-muted hover:text-brand transition-colors">Edit</button>
                <button onClick={() => onDelete(company.id)} className="text-text-muted hover:text-[hsl(348,75%,58%)] transition-colors">Delete</button>
              </div>
            </Card>
          )
        })}
      </div>
      <Pagination currentPage={currentPage} totalItems={companies.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={onPageChange} />
    </>
  )
})
