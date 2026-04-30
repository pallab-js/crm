import { ReactNode } from 'react'

interface SidebarProps {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-60 bg-bg border-r border-border-subtle min-h-screen p-3">
      {children}
    </aside>
  )
}

export function SidebarItem({ href, active = false, onClick, children }: { 
  href: string; 
  active?: boolean; 
  onClick?: () => void;
  children: ReactNode 
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      className={`block px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-bg-deep text-text-primary border border-border-prominent'
          : 'text-text-muted hover:text-text-primary hover:bg-bg-deep'
      }`}
    >
      {children}
    </a>
  )
}