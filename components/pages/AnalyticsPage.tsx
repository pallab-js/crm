'use client'
import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { formatCurrency } from '@/lib/constants'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, Clock, Target, Building2 } from 'lucide-react'

const COLORS = ['#3ecf8e', '#00c573', '#10b981', '#059669', '#047857']

export function AnalyticsPage() {
  const { contacts, deals, tasks, companies } = useAppStore()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [industryFilter, setIndustryFilter] = useState<string>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  const industries = useMemo(() => {
    const sets = new Set(companies.map(c => c.industry).filter(Boolean))
    return Array.from(sets)
  }, [companies])

  const filteredData = useMemo(() => {
    const now = new Date()
    let startDate = new Date(0)
    
    if (dateRange === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    else if (dateRange === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    else if (dateRange === '90d') startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    const d = deals.filter(deal => {
      const dealDate = new Date(deal.created_at)
      const matchesDate = dateRange === 'all' || dealDate >= startDate
      const company = companies.find(c => c.id === deal.company_id)
      const matchesIndustry = industryFilter === 'all' || company?.industry === industryFilter
      return matchesDate && matchesIndustry
    })

    const c = contacts.filter(contact => {
      const contactDate = new Date(contact.created_at)
      const matchesDate = dateRange === 'all' || contactDate >= startDate
      const company = companies.find(c => c.id === contact.company_id)
      const matchesIndustry = industryFilter === 'all' || company?.industry === industryFilter
      return matchesDate && matchesIndustry
    })

    return { deals: d, contacts: c }
  }, [deals, contacts, companies, dateRange, industryFilter])

  // Metrics
  const pipelineValue = filteredData.deals.reduce((sum, d) => sum + d.value, 0)
  const weightedValue = filteredData.deals.reduce((sum, d) => sum + (d.value * (d.probability || 0) / 100), 0)
  const wonValue = filteredData.deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0)
  const conversionRate = filteredData.deals.length > 0 ? Math.round((filteredData.deals.filter(d => d.stage === 'closed_won').length / filteredData.deals.length) * 100) : 0

  // Sales Velocity (Lead to Won)
  const salesVelocity = useMemo(() => {
    const closedWon = deals.filter(d => d.stage === 'closed_won')
    if (closedWon.length === 0) return 0
    const totalDays = closedWon.reduce((sum, d) => {
      const start = new Date(d.created_at)
      const end = new Date(d.updated_at)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    }, 0)
    return Math.round(totalDays / closedWon.length)
  }, [deals])

  // Revenue by Industry
  const industryData = useMemo(() => {
    const data: Record<string, number> = {}
    deals.filter(d => d.stage === 'closed_won').forEach(d => {
      const company = companies.find(c => c.id === d.company_id)
      const industry = company?.industry || 'Unknown'
      data[industry] = (data[industry] || 0) + d.value
    })
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [deals, companies])

  // Top Accounts
  const topAccounts = useMemo(() => {
    const data: Record<string, { name: string, value: number, count: number }> = {}
    deals.filter(d => d.stage === 'closed_won').forEach(d => {
      if (!d.company_id) return
      if (!data[d.company_id]) {
        const company = companies.find(c => c.id === d.company_id)
        data[d.company_id] = { name: company?.name || 'Unknown', value: 0, count: 0 }
      }
      data[d.company_id].value += d.value
      data[d.company_id].count += 1
    })
    return Object.values(data).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [deals, companies])

  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = new Date()
      month.setMonth(month.getMonth() - (5 - i))
      const monthStr = month.toLocaleDateString('en-US', { month: 'short' })
      const created = month.toISOString().slice(0, 7)
      return {
        name: monthStr,
        contacts: contacts.filter(c => c.created_at.startsWith(created)).length,
        deals: deals.filter(d => d.created_at.startsWith(created)).length,
        won: deals.filter(d => d.stage === 'closed_won' && d.updated_at.startsWith(created)).length,
      }
    })
  }, [contacts, deals])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-deep border border-border-base rounded-lg p-3 shadow-2xl">
          <p className="text-text-primary font-semibold mb-1">{label}</p>
          {payload.map((p: any) => (
            <div key={p.name} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-text-muted">{p.name}:</span>
              <span className="text-text-primary font-medium">
                {p.name.includes('Value') || p.name.includes('Revenue') ? formatCurrency(p.value) : p.value}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Analytics</h1>
          <p className="text-text-secondary mt-2">Deep insights into your sales performance</p>
        </div>
        
        <div className="flex gap-3 bg-bg-deep border border-border-base rounded-xl p-2">
          <div className="flex bg-bg border border-border-subtle rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-md text-xs transition-all ${dateRange === range ? 'bg-brand text-bg font-semibold' : 'text-text-muted hover:text-text-primary'}`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="bg-bg border border-border-subtle rounded-lg px-3 py-1 text-xs text-text-primary focus:outline-none"
          >
            <option value="all">All Industries</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4 border-none bg-gradient-to-br from-brand/10 to-transparent">
          <div className="flex items-center gap-2 text-brand mb-2">
            <Target className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Pipeline</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(pipelineValue)}</p>
          <p className="text-[10px] text-text-muted mt-1">Total active deals</p>
        </Card>
        <Card className="p-4 border-none bg-bg-deep">
          <div className="flex items-center gap-2 text-[hsl(251,63.2%,63.2%)] mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Weighted</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(weightedValue)}</p>
          <p className="text-[10px] text-text-muted mt-1">Prob-adjusted value</p>
        </Card>
        <Card className="p-4 border-none bg-bg-deep">
          <div className="flex items-center gap-2 text-brand mb-2">
            <Badge className="h-4 px-1 text-[8px]">WIN</Badge>
            <span className="text-[10px] uppercase tracking-wider font-bold">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-brand">{formatCurrency(wonValue)}</p>
          <p className="text-[10px] text-text-muted mt-1">Total closed won</p>
        </Card>
        <Card className="p-4 border-none bg-bg-deep">
          <div className="flex items-center gap-2 text-[hsl(53,92%,50%)] mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Velocity</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{salesVelocity} Days</p>
          <p className="text-[10px] text-text-muted mt-1">Avg time to close</p>
        </Card>
        <Card className="p-4 border-none bg-bg-deep">
          <div className="flex items-center gap-2 text-text-secondary mb-2">
            <Target className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{conversionRate}%</p>
          <p className="text-[10px] text-text-muted mt-1">Deal success ratio</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-text-primary font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand" />
              Growth Trends
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280} minWidth={0}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ecf8e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3ecf8e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#898989" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#898989" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="contacts" stroke="#3ecf8e" fillOpacity={1} fill="url(#colorContacts)" strokeWidth={2} />
              <Area type="monotone" dataKey="deals" stroke="#00c573" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              <Area type="monotone" dataKey="won" stroke="#ffffff" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-text-primary font-semibold mb-6 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" />
            Revenue by Industry
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={industryData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#898989" fontSize={10} width={80} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3ecf8e" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 col-span-2">
          <h3 className="text-text-primary font-semibold mb-6">Top Contributing Accounts</h3>
          <div className="space-y-4">
            {topAccounts.map((account, i) => (
              <div key={account.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-deep transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-text-primary font-medium text-sm">{account.name}</p>
                    <p className="text-text-muted text-[10px]">{account.count} deals closed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-brand font-bold">{formatCurrency(account.value)}</p>
                  <p className="text-[10px] text-text-muted uppercase">Total Revenue</p>
                </div>
              </div>
            ))}
            {topAccounts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-text-muted text-sm italic">No closed deals yet to rank accounts.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-text-primary font-semibold mb-6">Pipeline Health</h3>
          <div className="space-y-6">
            <div className="text-center py-4">
              <p className="text-text-muted text-xs uppercase mb-1">Average Deal Size</p>
              <p className="text-3xl font-bold text-text-primary">
                {formatCurrency(deals.length > 0 ? pipelineValue / deals.length : 0)}
              </p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border-subtle">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted">Conversion Probability</span>
                <span className="text-brand font-bold">{conversionRate}%</span>
              </div>
              <div className="w-full bg-bg-deep rounded-full h-1.5 overflow-hidden">
                <div className="bg-brand h-full" style={{ width: `${conversionRate}%` }} />
              </div>
              
              <div className="flex justify-between items-center text-xs pt-2">
                <span className="text-text-muted">Target Attainment</span>
                <span className="text-text-primary font-bold">78%</span>
              </div>
              <div className="w-full bg-bg-deep rounded-full h-1.5 overflow-hidden">
                <div className="bg-[hsl(251,63.2%,63.2%)] h-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}