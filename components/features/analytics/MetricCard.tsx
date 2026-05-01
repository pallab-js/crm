import { memo, ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

interface Props {
  label: string
  value: string
  subLabel: string
  icon: ReactNode
  iconColor?: string
  cardClass?: string
}

export const MetricCard = memo(function MetricCard({ label, value, subLabel, icon, iconColor = 'text-brand', cardClass = 'bg-bg-deep border-none' }: Props) {
  return (
    <Card className={`p-4 ${cardClass}`}>
      <div className={`flex items-center gap-2 ${iconColor} mb-2`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-muted mt-1">{subLabel}</p>
    </Card>
  )
})
