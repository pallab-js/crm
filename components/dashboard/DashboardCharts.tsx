'use client'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts'

const COLORS = ['#3ecf8e', '#00c573', '#2e2e2e', '#404040', '#171717']

export function DashboardCharts() {
  const { contacts, deals, tasks } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - (5 - i))
    const monthStr = month.toLocaleDateString('en-US', { month: 'short' })
    const created = month.toISOString().slice(0, 7)
    return {
      name: monthStr,
      contacts: contacts.filter(c => c.created_at.startsWith(created)).length,
      deals: deals.filter(d => d.created_at.startsWith(created)).length,
    }
  })

  const dealByStage = [
    { name: 'Lead', value: deals.filter(d => d.stage === 'lead').length },
    { name: 'Qualified', value: deals.filter(d => d.stage === 'qualified').length },
    { name: 'Proposal', value: deals.filter(d => d.stage === 'proposal').length },
    { name: 'Negotiation', value: deals.filter(d => d.stage === 'negotiation').length },
    { name: 'Won', value: deals.filter(d => d.stage === 'closed_won').length },
  ].filter(d => d.value > 0)

  if (!mounted) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[280px]" />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-text-primary font-medium mb-4">Growth Trend</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={monthlyData}>
              <XAxis 
                dataKey="name" 
                stroke="#404040" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ background: '#0a0a0a', border: '1px solid #2e2e2e', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#fafafa' }}
              />
              <Line 
                type="monotone" 
                dataKey="contacts" 
                stroke="#3ecf8e" 
                strokeWidth={2} 
                dot={false} 
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="deals" 
                stroke="#00c573" 
                strokeWidth={2} 
                dot={false} 
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="text-text-primary font-medium mb-4">Deal Distribution</h3>
        <div className="h-[200px] flex items-center">
          <div className="flex-1 h-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={dealByStage}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {dealByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #2e2e2e', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/3 space-y-2">
            {dealByStage.slice(0, 3).map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-text-muted uppercase tracking-wider">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
