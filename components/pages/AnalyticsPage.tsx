'use client'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const COLORS = ['#3ecf8e', '#00c573', '#898989', '#b4b4b4', '#363636']

export function AnalyticsPage() {
  const { contacts, deals, tasks } = useAppStore()

  const contactByStatus = [
    { name: 'Leads', value: contacts.filter(c => c.status === 'lead').length },
    { name: 'Customers', value: contacts.filter(c => c.status === 'customer').length },
    { name: 'Inactive', value: contacts.filter(c => c.status === 'inactive').length },
  ].filter(d => d.value > 0)

  const dealByStage = [
    { name: 'Lead', value: deals.filter(d => d.stage === 'lead').length },
    { name: 'Qualified', value: deals.filter(d => d.stage === 'qualified').length },
    { name: 'Proposal', value: deals.filter(d => d.stage === 'proposal').length },
    { name: 'Negotiation', value: deals.filter(d => d.stage === 'negotiation').length },
    { name: 'Won', value: deals.filter(d => d.stage === 'closed_won').length },
    { name: 'Lost', value: deals.filter(d => d.stage === 'closed_lost').length },
  ].filter(d => d.value > 0)

  const taskByStatus = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ]

  const pipelineValue = deals.reduce((sum, d) => sum + d.value, 0)
  const weightedValue = deals.reduce((sum, d) => sum + (d.value * (d.probability || 0) / 100), 0)
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0)
  const conversionRate = deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100) : 0
  const avgDealValue = deals.length > 0 ? Math.round(pipelineValue / deals.length) : 0

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - (5 - i))
    const monthStr = month.toLocaleDateString('en-US', { month: 'short' })
    const created = month.toISOString().slice(0, 7)
    return {
      name: monthStr,
      contacts: contacts.filter(c => c.created_at.startsWith(created)).length,
      deals: deals.filter(d => d.created_at.startsWith(created)).length,
      tasks: tasks.filter(t => t.created_at.startsWith(created)).length,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[72px] leading-[1.00] font-normal text-text-primary">Analytics</h1>
        <p className="text-text-secondary mt-2">Your CRM insights and metrics</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-text-muted text-sm">Total Pipeline</p>
          <p className="text-[32px] text-text-primary">${pipelineValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Weighted Value</p>
          <p className="text-[32px] text-brand">${weightedValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Won Revenue</p>
          <p className="text-[32px] text-brand">${wonValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Conversion Rate</p>
          <p className="text-[32px] text-text-primary">{conversionRate}%</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="text-text-primary font-medium mb-4">Activity Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#898989" fontSize={12} />
              <YAxis stroke="#898989" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: '#171717', border: '1px solid #2e2e2e', borderRadius: '8px' }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Line type="monotone" dataKey="contacts" stroke="#3ecf8e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="deals" stroke="#00c573" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tasks" stroke="#b4b4b4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-text-primary font-medium mb-4">Deals by Stage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dealByStage}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {dealByStage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#171717', border: '1px solid #2e2e2e', borderRadius: '8px' }}
                labelStyle={{ color: '#fafafa' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-text-primary font-medium mb-4">Contacts by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={contactByStatus}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {contactByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#171717', border: '1px solid #2e2e2e', borderRadius: '8px' }}
                labelStyle={{ color: '#fafafa' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-text-primary font-medium mb-4">Tasks Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskByStatus}>
              <XAxis dataKey="name" stroke="#898989" fontSize={12} />
              <YAxis stroke="#898989" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: '#171717', border: '1px solid #2e2e2e', borderRadius: '8px' }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Bar dataKey="value" fill="#3ecf8e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-text-muted text-sm">Avg Deal Value</p>
          <p className="text-[24px] text-text-primary">${avgDealValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Total Contacts</p>
          <p className="text-[24px] text-text-primary">{contacts.length}</p>
        </Card>
        <Card>
          <p className="text-text-muted text-sm">Total Tasks</p>
          <p className="text-[24px] text-text-primary">{tasks.length}</p>
        </Card>
      </div>
    </div>
  )
}