import { Activity } from '@/lib/ipc'
import { Card } from '@/components/ui/Card'

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <p className="text-text-muted text-base">No recent activity</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-[18px] text-text-primary mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-border-subtle last:border-0">
            <div className="w-2 h-2 rounded-full bg-brand mt-2" />
            <div className="flex-1">
              <p className="text-text-primary text-[14px]">{item.message}</p>
              <p className="text-text-muted text-[12px] mt-1">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}