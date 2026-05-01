import { memo } from 'react'
import { Card } from '@/components/ui/Card'

interface Stat {
  label: string
  value: string
  delta?: number
}

export const StatCard = memo(function StatCard({ label, value, delta }: Stat) {
  const positive = delta !== undefined && delta >= 0
  return (
    <Card>
      <p className="text-[13px] text-text-muted mb-1">{label}</p>
      <p className="text-[28px] text-text-primary leading-tight">{value}</p>
      {delta !== undefined && (
        <p className={`text-[12px] mt-1 ${positive ? 'text-brand' : 'text-text-muted'}`}>
          {positive ? '+' : ''}{delta}%
        </p>
      )}
    </Card>
  )
})