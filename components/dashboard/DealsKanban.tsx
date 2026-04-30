'use client'
import { useAppStore } from '@/store/dashboard'
import { DEAL_STAGES, STAGE_COLORS, formatCurrency } from '@/lib/constants'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Calendar, DollarSign, User, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DealsKanban({ onDealClick }: { onDealClick?: (deal: any) => void }) {
  const { deals, contacts, updateDeal } = useAppStore()

  const getContactName = (id: string) => contacts.find(c => c.id === id)?.name || 'Unknown'

  const moveDeal = async (id: string, currentStage: string, direction: 'next' | 'prev') => {
    const currentIndex = DEAL_STAGES.indexOf(currentStage as any)
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (nextIndex >= 0 && nextIndex < DEAL_STAGES.length) {
      await updateDeal(id, { stage: DEAL_STAGES[nextIndex] })
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 h-[calc(100vh-280px)] min-h-[500px]">
      {DEAL_STAGES.map((stage) => (
        <div key={stage} className="flex-shrink-0 w-80 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary capitalize">{stage.replace('_', ' ')}</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-bg-deep border border-border-base rounded-full text-text-muted">
                {deals.filter(d => d.stage === stage).length}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {formatCurrency(deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.value, 0))}
            </p>
          </div>

          <div className="flex-1 bg-bg-deep/50 border border-border-subtle rounded-xl p-2 space-y-3 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {deals.filter(d => d.stage === stage).map((deal) => (
                <motion.div
                  key={deal.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="p-3 hover:border-brand-border transition-colors group cursor-pointer"
                    onClick={() => onDealClick?.(deal)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors line-clamp-1">{deal.title}</h4>
                      <button className="text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <DollarSign className="w-3 h-3" />
                        <span className="text-text-secondary font-medium">{formatCurrency(deal.value)}</span>
                        <span className="opacity-50">·</span>
                        <span className="text-brand">{deal.probability}%</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <User className="w-3 h-3" />
                        <span className="line-clamp-1">{getContactName(deal.contact_id)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border-subtle">
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                        <Calendar className="w-3 h-3" />
                        {new Date(deal.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>

                      <div className="flex gap-1">
                        {DEAL_STAGES.indexOf(stage as any) > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveDeal(deal.id, stage, 'prev') }}
                            className="p-1 hover:bg-bg border border-border-base rounded text-text-muted hover:text-text-primary transition-all"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {DEAL_STAGES.indexOf(stage as any) < DEAL_STAGES.length - 1 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveDeal(deal.id, stage, 'next') }}
                            className="p-1 hover:bg-brand/10 border border-border-base hover:border-brand/30 rounded text-text-muted hover:text-brand transition-all"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {deals.filter(d => d.stage === stage).length === 0 && (
              <div className="h-24 border border-dashed border-border-base rounded-xl flex items-center justify-center">
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium">Empty Stage</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
