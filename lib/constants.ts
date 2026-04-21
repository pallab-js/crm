export const DEAL_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const

export const STAGE_PROBABILITIES: Record<string, number> = {
  lead: 10,
  qualified: 25,
  proposal: 50,
  negotiation: 75,
  closed_won: 100,
  closed_lost: 0,
}

export const STAGE_COLORS: Record<string, { border: string; bg: string }> = {
  lead: { border: 'border-text-muted', bg: 'bg-text-muted/10' },
  qualified: { border: 'border-text-secondary', bg: 'bg-text-secondary/10' },
  proposal: { border: 'border-blue-400', bg: 'bg-blue-400/10' },
  negotiation: { border: 'border-yellow-400', bg: 'bg-yellow-400/10' },
  closed_won: { border: 'border-brand', bg: 'bg-brand/10' },
  closed_lost: { border: 'border-red-400', bg: 'bg-red-400/10' },
}

export const CONTACT_STATUSES = ['lead', 'customer', 'inactive'] as const

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const

export const RECURRING_OPTIONS = ['', 'daily', 'weekly', 'monthly'] as const

export const ITEMS_PER_PAGE = 20

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}