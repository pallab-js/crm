'use client'
import { useAppStore } from '@/store/dashboard'
import { Note, Email, Deal, Task } from '@/lib/ipc'
import { formatDate } from '@/lib/constants'
import { MessageSquare, Mail, Briefcase, Clock, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ActivityTimelineProps {
  contactId?: string
  companyId?: string
  dealId?: string
}

type ActivityItem = 
  | { type: 'note'; data: Note; timestamp: string }
  | { type: 'email'; data: Email; timestamp: string }
  | { type: 'deal'; data: Deal; timestamp: string }
  | { type: 'task'; data: Task; timestamp: string }

export function ActivityTimeline({ contactId, companyId, dealId }: ActivityTimelineProps) {
  const { notes, emails, deals, tasks, contacts } = useAppStore()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedItems(newExpanded)
  }

  const items: ActivityItem[] = [
    ...(contactId 
      ? [
          ...notes.filter(n => n.contact_id === contactId).map(n => ({ type: 'note' as const, data: n, timestamp: n.created_at })),
          ...emails.filter(e => e.contact_id === contactId).map(e => ({ type: 'email' as const, data: e, timestamp: e.created_at })),
          ...deals.filter(d => d.contact_id === contactId).map(d => ({ type: 'deal' as const, data: d, timestamp: d.created_at })),
          ...tasks.filter(t => t.contact_id === contactId).map(t => ({ type: 'task' as const, data: t, timestamp: t.created_at }))
        ]
      : companyId
      ? [
          ...notes.filter(n => contacts.find(c => c.id === n.contact_id)?.company_id === companyId).map(n => ({ type: 'note' as const, data: n, timestamp: n.created_at })),
          ...emails.filter(e => contacts.find(c => c.id === e.contact_id)?.company_id === companyId).map(e => ({ type: 'email' as const, data: e, timestamp: e.created_at })),
          ...deals.filter(d => d.company_id === companyId).map(d => ({ type: 'deal' as const, data: d, timestamp: d.created_at })),
          ...tasks.filter(t => t.company_id === companyId).map(t => ({ type: 'task' as const, data: t, timestamp: t.created_at }))
        ]
      : dealId
      ? (() => {
          const deal = deals.find(d => d.id === dealId)
          const contactIdForDeal = deal?.contact_id
          return [
            ...tasks.filter(t => t.deal_id === dealId).map(t => ({ type: 'task' as const, data: t, timestamp: t.created_at })),
            ...(contactIdForDeal 
              ? [
                  ...notes.filter(n => n.contact_id === contactIdForDeal).map(n => ({ type: 'note' as const, data: n, timestamp: n.created_at })),
                  ...emails.filter(e => e.contact_id === contactIdForDeal).map(e => ({ type: 'email' as const, data: e, timestamp: e.created_at }))
                ] 
              : [])
          ]
        })()
      : []
    )
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (items.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-border-base rounded-xl bg-bg-deep/30">
        <Clock className="w-8 h-8 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary text-sm">No activity recorded for this {contactId ? 'contact' : companyId ? 'company' : 'deal'} yet.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand/20 before:via-border-base before:to-transparent">
      {items.map((item, index) => {
        const id = item.data.id
        const isExpanded = expandedItems.has(id)
        
        return (
          <div key={id} className="relative flex items-start gap-6 group">
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all",
              item.type === 'note' ? "bg-bg-deep border-[hsl(251,63.2%,63.2%)]/30 text-[hsl(251,63.2%,63.2%)]" :
              item.type === 'email' ? "bg-bg-deep border-brand/30 text-brand" :
              item.type === 'deal' ? "bg-bg-deep border-[hsl(53,92%,50%)]/30 text-[hsl(53,92%,50%)]" :
              "bg-bg-deep border-text-muted/30 text-text-muted"
            )}>
              {item.type === 'note' ? <MessageSquare className="w-4 h-4" /> :
               item.type === 'email' ? <Mail className="w-4 h-4" /> :
               item.type === 'deal' ? <Briefcase className="w-4 h-4" /> :
               <CheckCircle2 className="w-4 h-4" />}
            </div>

            <div className="flex-1 pt-1.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {item.type === 'note' ? 'Internal Note' :
                     item.type === 'email' ? `${item.data.direction === 'inbound' ? 'Received' : 'Sent'} Email` :
                     item.type === 'deal' ? 'Deal Interaction' :
                     'Assigned Task'}
                  </span>
                  <span className="text-[10px] text-text-muted opacity-50">·</span>
                  <span className="text-xs text-text-muted">{formatDate(item.timestamp)}</span>
                </div>
              </div>

              <div 
                className={cn(
                  "bg-bg border border-border-base rounded-xl p-3 transition-all cursor-pointer hover:border-brand/30",
                  isExpanded ? "shadow-lg ring-1 ring-brand/10" : ""
                )}
                onClick={() => toggleExpand(id)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-text-primary mb-1">
                      {item.type === 'note' ? 'Note added' :
                       item.type === 'email' ? item.data.subject :
                       item.data.title}
                    </h4>
                    <div className={cn(
                      "text-sm text-text-secondary transition-all overflow-hidden",
                      isExpanded ? "max-h-[1000px] opacity-100 mt-2 pt-2 border-t border-border-subtle" : "max-h-12 opacity-80 line-clamp-2"
                    )}>
                      {item.type === 'note' ? item.data.content :
                       item.type === 'email' ? item.data.body :
                       item.type === 'deal' ? `Deal stage: ${item.data.stage.replace('_', ' ')} · Value: $${item.data.value.toLocaleString()}` :
                       `Task status: ${item.data.status.replace('_', ' ')} · Due: ${item.data.due_date || 'No date'}`}
                    </div>
                  </div>
                  <div className="mt-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
