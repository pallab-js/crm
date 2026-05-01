'use client'
import { memo } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'
import { TrendingUp, Building2 } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'

interface MonthlyPoint { name: string; contacts: number; deals: number; won: number }
interface IndustryPoint { name: string; value: number }

interface Props {
  monthlyData: MonthlyPoint[]
  industryData: IndustryPoint[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-deep border border-border-base rounded-lg p-3 shadow-2xl">
      <p className="text-text-primary font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-muted">{p.name}:</span>
          <span className="text-text-primary font-medium">{p.name.includes('Value') || p.name.includes('Revenue') ? formatCurrency(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export const DealFunnelChart = memo(function DealFunnelChart({ monthlyData, industryData }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-text-primary font-semibold flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-brand" /> Growth Trends
        </h3>
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3ecf8e" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#3ecf8e" stopOpacity={0} />
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
          <Building2 className="w-4 h-4 text-brand" /> Revenue by Industry
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
  )
})
