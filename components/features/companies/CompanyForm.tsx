import { memo } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export interface CompanyFormData {
  name: string
  domain: string
  industry: string
  phone: string
  address: string
}

interface Props {
  data: CompanyFormData
  onChange: (d: CompanyFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  errors: Record<string, string>
  editingId: string | null
}

export const CompanyForm = memo(function CompanyForm({ data, onChange, onSubmit, onCancel, errors, editingId }: Props) {
  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-text-muted text-sm mb-1">Company Name</label>
            <input type="text" required value={data.name} onChange={e => onChange({ ...data, name: e.target.value })}
              className={`w-full bg-bg-deep border rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none ${errors.name ? 'border-[hsl(348,75%,58%)]' : 'border-border-base'}`} />
            {errors.name && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Domain</label>
            <input type="text" placeholder="example.com" value={data.domain} onChange={e => onChange({ ...data, domain: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
            {errors.domain && <p className="text-[hsl(348,75%,58%)] text-xs mt-1">{errors.domain}</p>}
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Industry</label>
            <input type="text" value={data.industry} onChange={e => onChange({ ...data, industry: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-1">Phone</label>
            <input type="tel" value={data.phone} onChange={e => onChange({ ...data, phone: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-text-muted text-sm mb-1">Address</label>
            <input type="text" value={data.address} onChange={e => onChange({ ...data, address: e.target.value })}
              className="w-full bg-bg-deep border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit">{editingId ? 'Update Company' : 'Save Company'}</Button>
          {editingId && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        </div>
      </form>
    </Card>
  )
})
