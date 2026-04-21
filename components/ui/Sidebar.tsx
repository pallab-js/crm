import { ReactNode } from 'react'

interface SidebarProps {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-64 bg-bg border-r border-border-subtle min-h-screen p-4">
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
      className={`block px-4 py-2 rounded-sm text-[14px] font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-bg-deep text-text-primary border border-border-prominent'
          : 'text-text-muted hover:text-text-primary hover:bg-bg-deep'
      }`}
    >
      {children}
    </a>
  )
}