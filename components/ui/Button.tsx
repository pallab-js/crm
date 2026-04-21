import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  primary: 'bg-bg-deep text-text-primary border border-text-primary rounded-pill px-8 py-2 text-[14px] font-medium focus:shadow-focus',
  secondary: 'bg-bg-deep text-text-primary border border-border-base rounded-pill px-8 py-2 text-[14px] font-medium opacity-80 focus:shadow-focus',
  ghost: 'bg-transparent text-text-primary border border-transparent rounded-sm px-2 py-2 text-[14px] hover:border-border-base',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`transition-opacity ${variants[variant]} ${className}`}
      {...props}
    />
  )
}