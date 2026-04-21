export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[12px] uppercase tracking-[1.2px] text-text-muted ${className}`}>
      {children}
    </span>
  )
}