import { memo } from 'react'
import { Contact, Deal, Company } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export interface TaskFormData {
  title: string
  description: string
  status: string
  due_date: string
  recurring: string
  contact_id: string
  deal_id: string
  company_id: string
}

interface Props {
  data: TaskFormData
  onChange: (d: TaskFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  titleError: string
  contacts: Contact[]
  deals: Deal[]
  companies: Company[]
}

export const TaskForm = memo(function TaskForm({ data, onChange, onSubmit, onCancel, titleError, contacts, deals, companies }: Props) {
  return (
    <Card className="border-brand/30 shadow-lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-text-muted text-[10px] uppercase mb-1">Task Title</label>
            <input type="text" required autoFocus placeholder="What needs to be done?" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary text-lg focus:border-brand-border focus:outline-none" />
            {titleError && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{titleError}</p>}
          </div>
          <div>
            <label className="block text-text-muted text-[10px] uppercase mb-1">Due Date</label>
            <input type="date" value={data.due_date} onChange={e => onChange({ ...data, due_date: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
          </div>
          <div>
            <label className="block text-text-muted text-[10px] uppercase mb-1">Recurrence</label>
            <select value={data.recurring} onChange={e => onChange({ ...data, recurring: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none">
              <option value="">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-[10px] uppercase mb-1">Related Contact</label>
            <select value={data.contact_id} onChange={e => onChange({ ...data, contact_id: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none text-sm">
              <option value="">None</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-[10px] uppercase mb-1">Related Deal</label>
            <select value={data.deal_id} onChange={e => onChange({ ...data, deal_id: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none text-sm">
              <option value="">None</option>
              {deals.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-text-muted text-[10px] uppercase mb-1">Related Company</label>
            <select value={data.company_id} onChange={e => onChange({ ...data, company_id: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none text-sm">
              <option value="">None</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-text-muted text-[10px] uppercase mb-1">Description</label>
            <textarea value={data.description} onChange={e => onChange({ ...data, description: e.target.value })} rows={3}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Create Task</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
})
