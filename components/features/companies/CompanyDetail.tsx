import { memo, useState } from 'react'
import { Company } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ActivityTimeline } from '@/components/ui/ActivityTimeline'

interface Props {
  company: Company
  stats: { contacts: number; deals: number; revenue: number }
  onClose: () => void
  onAddContact: (name: string, email: string, phone: string, status: string) => void
  onAddTask: (title: string, due_date: string, description: string) => void
  onAddDeal: (title: string, value: string, stage: string) => void
}

export const CompanyDetail = memo(function CompanyDetail({ company, stats, onClose, onAddContact, onAddTask, onAddDeal }: Props) {
  const [showContactForm, setShowContactForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showDealForm, setShowDealForm] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', status: 'lead' })
  const [taskForm, setTaskForm] = useState({ title: '', due_date: '', description: '' })
  const [dealForm, setDealForm] = useState({ title: '', value: '', stage: 'lead' })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={`Company: ${company.name}`}
        className="bg-bg border border-border-base rounded-[8px] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded bg-brand/20 flex items-center justify-center">
              <span className="text-brand font-medium text-2xl">{company.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-text-primary text-2xl">{company.name}</h2>
              <p className="text-text-secondary">{company.domain}</p>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-text-muted hover:text-text-primary text-2xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold">Details</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">Industry</span><span className="text-text-primary">{company.industry || '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Phone</span><span className="text-text-primary">{company.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Address</span><span className="text-text-primary">{company.address || '—'}</span></div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold">Performance</h3>
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-center bg-bg-deep border-none"><p className="text-text-primary font-bold">{stats.contacts}</p><p className="text-text-muted text-[10px] uppercase">People</p></Card>
              <Card className="p-3 text-center bg-bg-deep border-none"><p className="text-text-primary font-bold">{stats.deals}</p><p className="text-text-muted text-[10px] uppercase">Deals</p></Card>
              <Card className="p-3 text-center bg-bg-deep border-none"><p className="text-brand font-bold">${stats.revenue.toLocaleString()}</p><p className="text-text-muted text-[10px] uppercase">Rev</p></Card>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button onClick={() => setShowContactForm(!showContactForm)} className="flex-1" variant={showContactForm ? 'secondary' : 'primary'}>Add Person</Button>
          <Button onClick={() => setShowTaskForm(!showTaskForm)} className="flex-1" variant={showTaskForm ? 'secondary' : 'primary'}>Add Task</Button>
          <Button onClick={() => setShowDealForm(!showDealForm)} className="flex-1" variant={showDealForm ? 'secondary' : 'primary'}>Add Deal</Button>
        </div>

        {showContactForm && (
          <Card className="mb-6 bg-bg-deep border-brand/20">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">New Contact for {company.name}</h4>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Name" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
                <input type="email" placeholder="Email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { onAddContact(contactForm.name, contactForm.email, contactForm.phone, contactForm.status); setContactForm({ name: '', email: '', phone: '', status: 'lead' }); setShowContactForm(false) }} className="flex-1">Create Contact</Button>
                <Button onClick={() => setShowContactForm(false)} variant="ghost">Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {showTaskForm && (
          <Card className="mb-6 bg-bg-deep border-brand/20">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">New Task for {company.name}</h4>
              <input type="text" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <div className="flex gap-2">
                <Button onClick={() => { onAddTask(taskForm.title, taskForm.due_date, taskForm.description); setTaskForm({ title: '', due_date: '', description: '' }); setShowTaskForm(false) }} className="flex-1">Create Task</Button>
                <Button onClick={() => setShowTaskForm(false)} variant="ghost">Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {showDealForm && (
          <Card className="mb-6 bg-bg-deep border-brand/20">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">New Deal for {company.name}</h4>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Deal title" value={dealForm.title} onChange={e => setDealForm({ ...dealForm, title: e.target.value })}
                  className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
                <input type="number" placeholder="Value ($)" value={dealForm.value} onChange={e => setDealForm({ ...dealForm, value: e.target.value })}
                  className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { onAddDeal(dealForm.title, dealForm.value, dealForm.stage); setDealForm({ title: '', value: '', stage: 'lead' }); setShowDealForm(false) }} className="flex-1">Create Deal</Button>
                <Button onClick={() => setShowDealForm(false)} variant="ghost">Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="border-t border-border-subtle pt-6">
          <h3 className="text-text-primary font-semibold mb-4">Company Activity Feed</h3>
          <ActivityTimeline companyId={company.id} />
        </div>
      </div>
    </div>
  )
})
