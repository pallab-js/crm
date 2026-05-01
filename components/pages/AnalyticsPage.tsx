'use client'
import { useState, useMemo, lazy, Suspense } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, Clock, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'
import { AnalyticsFilters } from '@/components/features/analytics/AnalyticsFilters'
import { MetricCard } from '@/components/features/analytics/MetricCard'

const DealFunnelChart = lazy(() => import('@/components/features/analytics/DealFunnelChart').then(m => ({ default: m.DealFunnelChart })))

export function AnalyticsPage() {
  const { contacts, deals, companies } = useAppStore()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [industryFilter, setIndustryFilter] = useState('all')

  const industries = useMemo(() => [...new Set(companies.map(c => c.industry).filter(Boolean))], [companies])

  const filteredData = useMemo(() => {
    const now = new Date()
    const offsets: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
    const startDate = dateRange === 'all' ? new Date(0) : new Date(now.getTime() - offsets[dateRange] * 86400000)
    const matchesFilters = (created_at: string, company_id?: string) => {
      const matchesDate = dateRange === 'all' || new Date(created_at) >= startDate
      const company = companies.find(c => c.id === company_id)
      const matchesIndustry = industryFilter === 'all' || company?.industry === industryFilter
      return matchesDate && matchesIndustry
    }
    return {
      deals: deals.filter(d => matchesFilters(d.created_at, d.company_id)),
      contacts: contacts.filter(c => matchesFilters(c.created_at, c.company_id)),
    }
  }, [deals, contacts, companies, dateRange, industryFilter])

  const pipelineValue = useMemo(() => filteredData.deals.reduce((s, d) => s + d.value, 0), [filteredData.deals])
  const weightedValue = useMemo(() => filteredData.deals.reduce((s, d) => s + d.value * (d.probability / 100), 0), [filteredData.deals])
  const wonValue = useMemo(() => filteredData.deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + d.value, 0), [filteredData.deals])
  const conversionRate = useMemo(() => filteredData.deals.length > 0 ? Math.round(filteredData.deals.filter(d => d.stage === 'closed_won').length / filteredData.deals.length * 100) : 0, [filteredData.deals])

  const salesVelocity = useMemo(() => {
    const won = deals.filter(d => d.stage === 'closed_won')
    if (!won.length) return 0
    return Math.round(won.reduce((s, d) => s + (new Date(d.updated_at).getTime() - new Date(d.created_at).getTime()) / 86400000, 0) / won.length)
  }, [deals])

  const monthlyData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const month = new Date(); month.setMonth(month.getMonth() - (5 - i))
    const created = month.toISOString().slice(0, 7)
    return { name: month.toLocaleDateString('en-US', { month: 'short' }), contacts: contacts.filter(c => c.created_at.startsWith(created)).length, deals: deals.filter(d => d.created_at.startsWith(created)).length, won: deals.filter(d => d.stage === 'closed_won' && d.updated_at.startsWith(created)).length }
  }), [contacts, deals])

  const industryData = useMemo(() => {
    const data: Record<string, number> = {}
    deals.filter(d => d.stage === 'closed_won').forEach(d => {
      const industry = companies.find(c => c.id === d.company_id)?.industry ?? 'Unknown'
      data[industry] = (data[industry] ?? 0) + d.value
    })
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [deals, companies])

  const topAccounts = useMemo(() => {
    const data: Record<string, { name: string; value: number; count: number }> = {}
    deals.filter(d => d.stage === 'closed_won' && d.company_id).forEach(d => {
      if (!data[d.company_id!]) data[d.company_id!] = { name: companies.find(c => c.id === d.company_id)?.name ?? 'Unknown', value: 0, count: 0 }
      data[d.company_id!].value += d.value
      data[d.company_id!].count += 1
    })
    return Object.values(data).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [deals, companies])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Analytics</h1>
          <p className="text-text-secondary mt-2">Deep insights into your sales performance</p>
        </div>
        <AnalyticsFilters dateRange={dateRange} onDateRangeChange={setDateRange} industryFilter={industryFilter} onIndustryFilterChange={setIndustryFilter} industries={industries} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Pipeline" value={formatCurrency(pipelineValue)} subLabel="Total active deals" icon={<Target className="w-4 h-4" />} cardClass="p-4 border-none bg-gradient-to-br from-brand/10 to-transparent" />
        <MetricCard label="Weighted" value={formatCurrency(Math.round(weightedValue))} subLabel="Prob-adjusted value" icon={<TrendingUp className="w-4 h-4" />} iconColor="text-[hsl(251,63.2%,63.2%)]" />
        <MetricCard label="Revenue" value={formatCurrency(wonValue)} subLabel="Total closed won" icon={<Badge className="h-4 px-1 text-[8px]">WIN</Badge>} />
        <MetricCard label="Velocity" value={`${salesVelocity} Days`} subLabel="Avg time to close" icon={<Clock className="w-4 h-4" />} iconColor="text-[hsl(53,92%,50%)]" />
        <MetricCard label="Win Rate" value={`${conversionRate}%`} subLabel="Deal success ratio" icon={<Target className="w-4 h-4" />} iconColor="text-text-secondary" />
      </div>

      <Suspense fallback={<div className="grid grid-cols-2 gap-6 h-[320px]" />}>
        <DealFunnelChart monthlyData={monthlyData} industryData={industryData} />
      </Suspense>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 col-span-2">
          <h3 className="text-text-primary font-semibold mb-6">Top Contributing Accounts</h3>
          <div className="space-y-4">
            {topAccounts.map((account, i) => (
              <div key={account.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-deep transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">{i + 1}</div>
                  <div><p className="text-text-primary font-medium text-sm">{account.name}</p><p className="text-text-muted text-[10px]">{account.count} deals closed</p></div>
                </div>
                <div className="text-right"><p className="text-brand font-bold">{formatCurrency(account.value)}</p><p className="text-[10px] text-text-muted uppercase">Total Revenue</p></div>
              </div>
            ))}
            {topAccounts.length === 0 && <div className="py-12 text-center"><p className="text-text-muted text-sm italic">No closed deals yet to rank accounts.</p></div>}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-text-primary font-semibold mb-6">Pipeline Health</h3>
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-text-muted text-xs uppercase mb-1">Average Deal Size</p>
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(deals.length > 0 ? pipelineValue / deals.length : 0)}</p>
            </div>
            <div className="space-y-4 pt-4 border-t border-border-subtle">
              <div className="flex justify-between items-center text-xs"><span className="text-text-muted">Conversion Probability</span><span className="text-brand font-bold">{conversionRate}%</span></div>
              <div className="w-full bg-bg-deep rounded-full h-1.5 overflow-hidden"><div className="bg-brand h-full" style={{ width: `${conversionRate}%` }} /></div>
              <div className="flex justify-between items-center text-xs pt-2"><span className="text-text-muted">Target Attainment</span><span className="text-text-primary font-bold">78%</span></div>
              <div className="w-full bg-bg-deep rounded-full h-1.5 overflow-hidden"><div className="bg-[hsl(251,63.2%,63.2%)] h-full" style={{ width: '78%' }} /></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
