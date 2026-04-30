'use client'
import { useAppStore } from '@/store/dashboard'
import { Card } from '@/components/ui/Card'
import { TrendingUp, Target, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'

export function SalesProgress() {
  const { deals, settings } = useAppStore()
  
  const monthlyTarget = settings.monthly_target || 100000
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  
  const wonThisMonth = deals
    .filter(d => d.stage === 'closed_won' && d.updated_at.startsWith(currentMonth))
    .reduce((sum, d) => sum + d.value, 0)

  const percentage = Math.min(Math.round((wonThisMonth / monthlyTarget) * 100), 100)
  const remaining = Math.max(monthlyTarget - wonThisMonth, 0)

  return (
    <Card className="h-full bg-gradient-to-br from-bg to-bg-deep border-brand/20 relative overflow-hidden group p-4">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-semibold text-text-primary tracking-tight">Monthly Target</h3>
          </div>
          <span className="text-[9px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {percentage}% Achieved
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-end justify-between mb-2">
              <p className="text-2xl font-bold text-text-primary tracking-tighter">
                ${wonThisMonth.toLocaleString()}
              </p>
              <p className="text-text-muted text-[10px] mb-1">
                Goal: ${monthlyTarget.toLocaleString()}
              </p>
            </div>
            
            <div className="h-1.5 w-full bg-bg-deep rounded-full overflow-hidden border border-border-subtle">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-brand shadow-[0_0_12px_rgba(var(--brand-rgb),0.3)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-2.5 bg-bg border border-border-subtle rounded-xl">
              <p className="text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1">Remaining</p>
              <p className="text-sm font-bold text-text-primary">${remaining.toLocaleString()}</p>
            </div>
            <div className="p-2.5 bg-bg border border-border-subtle rounded-xl">
              <p className="text-[10px] uppercase text-text-muted font-bold tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand" />
                <p className="text-sm font-bold text-brand">On Track</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border-subtle flex items-center gap-2 text-text-muted text-[10px]">
          <DollarSign className="w-3 h-3" />
          <span>Calculated from "Closed Won" deals this month</span>
        </div>
      </div>
    </Card>
  )
}
