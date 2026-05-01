import { memo } from 'react'
import { Company } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export interface ContactFormData {
  name: string
  email: string
  phone: string
  company_id: string
  status: string
  tags: string[]
}

interface Props {
  data: ContactFormData
  onChange: (data: ContactFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  errors: Record<string, string>
  companies: Company[]
  tags: string[]
  editingId: string | null
}

export const ContactForm = memo(function ContactForm({
  data, onChange, onSubmit, onCancel, errors, companies, tags, editingId,
}: Props) {
  const toggleTag = (tag: string) => {
    const next = data.tags.includes(tag) ? data.tags.filter(t => t !== tag) : [...data.tags, tag]
    onChange({ ...data, tags: next })
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-sm mb-1">Name</label>
            <input type="text" required value={data.name} onChange={e => onChange({ ...data, name: e.target.value })}
              className={`w-full bg-bg-deep border rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none ${errors.name ? 'border-red-500' : 'border-border-base'}`} />
            {errors.name && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Email</label>
            <input type="email" required value={data.email} onChange={e => onChange({ ...data, email: e.target.value })}
              className={`w-full bg-bg-deep border rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none ${errors.email ? 'border-red-500' : 'border-border-base'}`} />
            {errors.email && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Phone</label>
            <input type="tel" value={data.phone} onChange={e => onChange({ ...data, phone: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
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
            <label className="block text-text-muted text-sm mb-1">Status</label>
            <select value={data.status} onChange={e => onChange({ ...data, status: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none">
              <option value="lead">Lead</option>
              <option value="customer">Customer</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded-[6px] text-xs border ${data.tags.includes(tag) ? 'bg-brand/20 border-brand text-brand' : 'border-border-base text-text-muted hover:border-brand'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{editingId ? 'Update Contact' : 'Save Contact'}</Button>
          {editingId && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        </div>
      </form>
    </Card>
  )
})
