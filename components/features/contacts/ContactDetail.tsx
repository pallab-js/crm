import { memo, useState } from 'react'
import { Contact, Note, Email } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ActivityTimeline } from '@/components/ui/ActivityTimeline'

const STATUS_COLORS: Record<string, string> = {
  lead: 'text-text-secondary',
  customer: 'text-brand',
  inactive: 'text-text-muted',
}

interface Props {
  contact: Contact
  getCompanyName: (id?: string) => string
  onClose: () => void
  onAddNote: (content: string) => void
  onAddEmail: (subject: string, body: string) => void
  onAddTask: (title: string, due_date: string, description: string) => void
  onAddDeal: (title: string, value: string, stage: string) => void
}

export const ContactDetail = memo(function ContactDetail({
  contact, getCompanyName, onClose, onAddNote, onAddEmail, onAddTask, onAddDeal,
}: Props) {
  const [newNote, setNewNote] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showDealForm, setShowDealForm] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' })
  const [taskForm, setTaskForm] = useState({ title: '', due_date: '', description: '' })
  const [dealForm, setDealForm] = useState({ title: '', value: '', stage: 'lead' })

  const handleAddNote = () => {
    if (!newNote.trim()) return
    onAddNote(newNote)
    setNewNote('')
  }

  const handleSendEmail = () => {
    if (!emailForm.subject.trim() || !emailForm.body.trim()) return
    onAddEmail(emailForm.subject, emailForm.body)
    setEmailForm({ subject: '', body: '' })
    setShowEmailForm(false)
  }

  const handleAddTask = () => {
    if (!taskForm.title.trim()) return
    onAddTask(taskForm.title, taskForm.due_date, taskForm.description)
    setTaskForm({ title: '', due_date: '', description: '' })
    setShowTaskForm(false)
  }

  const handleAddDeal = () => {
    if (!dealForm.title.trim() || !dealForm.value) return
    onAddDeal(dealForm.title, dealForm.value, dealForm.stage)
    setDealForm({ title: '', value: '', stage: 'lead' })
    setShowDealForm(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose} onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={`Contact: ${contact.name}`}
        className="bg-bg border border-border-base rounded-[8px] p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center">
              <span className="text-brand font-medium text-lg">{contact.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-text-primary text-lg">{contact.name}</h2>
              <Badge className={STATUS_COLORS[contact.status]}>{contact.status}</Badge>
            </div>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-text-muted hover:text-text-primary">×</button>
        </div>

        <div className="space-y-3 mb-6">
          <div><p className="text-text-muted text-xs uppercase tracking-wider">Email</p><p className="text-text-primary">{contact.email}</p></div>
          {contact.phone && <div><p className="text-text-muted text-xs uppercase tracking-wider">Phone</p><p className="text-text-primary">{contact.phone}</p></div>}
          {contact.company_id && <div><p className="text-text-muted text-xs uppercase tracking-wider">Company</p><p className="text-text-primary">{getCompanyName(contact.company_id)}</p></div>}
          {contact.tags.length > 0 && (
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider">Tags</p>
              <div className="flex gap-1 mt-1">{contact.tags.map(tag => <span key={tag} className="px-2 py-1 bg-brand/10 text-brand text-xs rounded">{tag}</span>)}</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <Button onClick={() => setShowEmailForm(!showEmailForm)} className="flex-1" variant={showEmailForm ? 'secondary' : 'primary'}>Email</Button>
          <Button onClick={() => setShowTaskForm(!showTaskForm)} className="flex-1" variant={showTaskForm ? 'secondary' : 'primary'}>Task</Button>
          <Button onClick={() => setShowDealForm(!showDealForm)} className="flex-1" variant={showDealForm ? 'secondary' : 'primary'}>Deal</Button>
        </div>

        {showEmailForm && (
          <Card className="mb-4 bg-bg-deep border-brand/20">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">Send Email</h4>
              <input type="text" placeholder="Subject" value={emailForm.subject} onChange={e => setEmailForm({ ...emailForm, subject: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <textarea placeholder="Message" rows={4} value={emailForm.body} onChange={e => setEmailForm({ ...emailForm, body: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <div className="flex gap-2">
                <Button onClick={handleSendEmail} className="flex-1">Send</Button>
                <Button onClick={() => setShowEmailForm(false)} variant="ghost">Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {showTaskForm && (
          <Card className="mb-4 bg-bg-deep border-brand/20">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">New Task</h4>
              <input type="text" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <textarea placeholder="Description (optional)" rows={2} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <div className="flex gap-2">
                <Button onClick={handleAddTask} className="flex-1">Create Task</Button>
                <Button onClick={() => setShowTaskForm(false)} variant="ghost">Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        {showDealForm && (
          <Card className="mb-4 bg-bg-deep border-brand/20">
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand">New Deal</h4>
              <input type="text" placeholder="Deal title" value={dealForm.title} onChange={e => setDealForm({ ...dealForm, title: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <input type="number" placeholder="Value ($)" value={dealForm.value} onChange={e => setDealForm({ ...dealForm, value: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none" />
              <select value={dealForm.stage} onChange={e => setDealForm({ ...dealForm, stage: e.target.value })}
                className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary focus:border-brand-border focus:outline-none">
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleAddDeal} className="flex-1">Create Deal</Button>
                <Button onClick={() => setShowDealForm(false)} variant="ghost">Cancel</Button>
              </div>
            </div>
          </Card>
        )}

        <div className="border-t border-border-subtle pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-text-primary font-semibold">Activity Timeline</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="Quick note..." value={newNote} onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                className="bg-bg-deep border border-border-base rounded-pill px-3 py-1 text-text-primary placeholder:text-text-muted focus:border-brand-border focus:outline-none text-xs" />
              <Button onClick={handleAddNote} className="h-7 px-3 py-0 text-xs">Add</Button>
            </div>
          </div>
          <ActivityTimeline contactId={contact.id} />
        </div>
      </div>
    </div>
  )
})
