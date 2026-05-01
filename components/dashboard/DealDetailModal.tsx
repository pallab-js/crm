'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ActivityTimeline } from '@/components/ui/ActivityTimeline'
import { STAGE_PROBABILITIES } from '@/lib/constants'

interface DealDetailModalProps {
  deal: any
  onClose: () => void
  onUpdate: (id: string, updates: any) => void
  addTask: (task: any) => void
  contacts: any[]
  companies: any[]
}

export function DealDetailModal({ deal, onClose, onUpdate, addTask, contacts, companies }: DealDetailModalProps) {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', due_date: '', description: '' })

  const handleAddTask = async () => {
    if (!taskForm.title) return
    const now = new Date().toISOString()
    await addTask({
      id: crypto.randomUUID(),
      deal_id: deal.id,
      contact_id: deal.contact_id,
      company_id: deal.company_id,
      title: taskForm.title,
      description: taskForm.description,
      status: 'todo',
      due_date: taskForm.due_date,
      created_at: now,
      updated_at: now,
    })
    setTaskForm({ title: '', due_date: '', description: '' })
    setShowTaskForm(false)
  }

  const getContactName = (id: string) => contacts.find(c => c.id === id)?.name || 'Unknown'

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Deal: ${deal.title}`}
        className="bg-bg border border-border-base rounded-[8px] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge className="mb-2">{deal.stage.replace('_', ' ')}</Badge>
            <h2 className="text-text-primary text-2xl font-semibold">{deal.title}</h2>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-text-muted hover:text-text-primary text-2xl">×</button>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Deal Value</p>
              <p className="text-3xl text-text-primary font-bold">${deal.value.toLocaleString()}</p>
              <div className="mt-4">
                <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Probability ({deal.probability}%)</p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={deal.probability}
                  onChange={e => onUpdate(deal.id, { probability: Number(e.target.value) })}
                  className="w-full h-2 bg-bg-deep rounded-lg appearance-none cursor-pointer accent-brand"
                />
                <p className="text-text-secondary text-xs mt-2 italic">
                  Weighted Value: ${(deal.value * deal.probability / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-text-muted text-xs uppercase tracking-wider font-semibold">Stakeholders</h3>
              {deal.contact_id && (
                <Card className="p-3 bg-bg-deep border-none">
                  <p className="text-text-muted text-[10px] uppercase">Primary Contact</p>
                  <p className="text-text-primary font-medium">{getContactName(deal.contact_id)}</p>
                </Card>
              )}
              {deal.company_id && (
                <Card className="p-3 bg-bg-deep border-none">
                  <p className="text-text-muted text-[10px] uppercase">Company</p>
                  <p className="text-text-primary font-medium">{companies.find(c => c.id === deal.company_id)?.name}</p>
                </Card>
              )}
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-primary font-semibold">Timeline</h3>
              <Button onClick={() => setShowTaskForm(!showTaskForm)} variant="ghost">Add Task</Button>
            </div>

            {showTaskForm && (
              <Card className="mb-4 bg-bg-deep border-brand/20">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary text-sm focus:border-brand-border focus:outline-none"
                  />
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full bg-bg border border-border-base rounded-[6px] px-3 py-2 text-text-primary text-sm focus:border-brand-border focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddTask} className="flex-1 text-xs py-1">Save</Button>
                    <Button onClick={() => setShowTaskForm(false)} variant="ghost" className="text-xs py-1">Cancel</Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <ActivityTimeline dealId={deal.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
