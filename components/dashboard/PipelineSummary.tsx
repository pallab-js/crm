'use client'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { DEAL_STAGES, STAGE_COLORS, formatCurrency } from '@/lib/constants'
import { ArrowRight } from 'lucide-react'

export function PipelineSummary() {
  const { deals, setCurrentView } = useAppStore()

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  
  const stageStats = DEAL_STAGES.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage)
    const value = stageDeals.reduce((sum, d) => sum + d.value, 0)
    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0
    return { stage, value, count: stageDeals.length, percentage }
  })

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] text-text-primary font-medium">Pipeline Summary</h3>
        <button 
          onClick={() => setCurrentView('deals')}
          className="text-text-muted hover:text-brand transition-colors flex items-center gap-1 text-xs"
        >
          Manage deals <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="h-2 w-full bg-bg-deep rounded-full overflow-hidden flex">
          {stageStats.map((stat, i) => (
            <div 
              key={stat.stage}
              style={{ width: `${stat.percentage}%`, backgroundColor: STAGE_COLORS[stat.stage as keyof typeof STAGE_COLORS]?.border || '#898989' }}
              className="h-full first:rounded-l-full last:rounded-r-full opacity-80 hover:opacity-100 transition-opacity"
              title={`${stat.stage}: ${formatCurrency(stat.value)}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
          {stageStats.map((stat) => (
            <div key={stat.stage} className="space-y-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: STAGE_COLORS[stat.stage as keyof typeof STAGE_COLORS]?.border || '#898989' }}
                />
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold truncate">
                  {stat.stage.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary">
                {formatCurrency(stat.value)}
              </p>
              <p className="text-[10px] text-text-muted">
                {stat.count} {stat.count === 1 ? 'deal' : 'deals'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
