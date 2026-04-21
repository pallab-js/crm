import { HTMLAttributes } from 'react'

export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-bg border border-border-base rounded-[8px] p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}