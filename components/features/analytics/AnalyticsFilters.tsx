import { memo } from 'react'

interface Props {
  dateRange: '7d' | '30d' | '90d' | 'all'
  onDateRangeChange: (r: '7d' | '30d' | '90d' | 'all') => void
  industryFilter: string
  onIndustryFilterChange: (v: string) => void
  industries: string[]
}

export const AnalyticsFilters = memo(function AnalyticsFilters({ dateRange, onDateRangeChange, industryFilter, onIndustryFilterChange, industries }: Props) {
  return (
    <div className="flex gap-3 bg-bg-deep border border-border-base rounded-xl p-2">
      <div className="flex bg-bg border border-border-subtle rounded-lg p-1">
        {(['7d', '30d', '90d', 'all'] as const).map(range => (
          <button key={range} onClick={() => onDateRangeChange(range)}
            className={`px-3 py-1 rounded-md text-xs transition-all ${dateRange === range ? 'bg-brand text-bg font-semibold' : 'text-text-muted hover:text-text-primary'}`}>
            {range.toUpperCase()}
          </button>
        ))}
      </div>
      <select value={industryFilter} onChange={e => onIndustryFilterChange(e.target.value)}
        className="bg-bg border border-border-subtle rounded-lg px-3 py-1 text-xs text-text-primary focus:outline-none">
        <option value="all">All Industries</option>
        {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
      </select>
    </div>
  )
})
