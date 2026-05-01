import { memo } from 'react'
import { Contact, Company } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DEAL_STAGES, STAGE_PROBABILITIES } from '@/lib/constants'

export interface DealFormData {
  title: string
  value: number
  stage: string
  probability: number
  contact_id: string
  company_id: string
  expected_close_date: string
}

interface Props {
  data: DealFormData
  onChange: (d: DealFormData) => void
  onSubmit: (e: React.FormEvent) => void
  errors: Record<string, string>
  contacts: Contact[]
  companies: Company[]
}

export const DealForm = memo(function DealForm({ data, onChange, onSubmit, errors, contacts, companies }: Props) {
  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-sm mb-1">Deal Title</label>
            <input type="text" required value={data.title} onChange={e => onChange({ ...data, title: e.target.value })}
              className={`w-full bg-bg-deep border rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none ${errors.title ? 'border-red-500' : 'border-border-base'}`} />
            {errors.title && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Value ($)</label>
            <input type="number" required min="0" value={data.value} onChange={e => onChange({ ...data, value: Number(e.target.value) })}
              className={`w-full bg-bg-deep border rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none ${errors.value ? 'border-red-500' : 'border-border-base'}`} />
            {errors.value && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{errors.value}</p>}
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Stage</label>
            <select value={data.stage} onChange={e => onChange({ ...data, stage: e.target.value, probability: STAGE_PROBABILITIES[e.target.value] ?? 10 })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none">
              {DEAL_STAGES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Probability ({data.probability}%)</label>
            <input type="range" min="0" max="100" step="5" value={data.probability} onChange={e => onChange({ ...data, probability: Number(e.target.value) })}
              className="w-full h-2 bg-bg-deep rounded-lg appearance-none cursor-pointer accent-brand mt-4" />
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Contact</label>
            <select value={data.contact_id} onChange={e => onChange({ ...data, contact_id: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none">
              <option value="">Select contact</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Company</label>
            <select value={data.company_id} onChange={e => onChange({ ...data, company_id: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none">
              <option value="">Select company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Expected Close Date</label>
            <input type="date" value={data.expected_close_date} onChange={e => onChange({ ...data, expected_close_date: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
          </div>
        </div>
        <Button type="submit">Save Deal</Button>
      </form>
    </Card>
  )
})
