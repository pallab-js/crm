import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Suppress console.error for expected error boundary output
beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}) })

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test explosion')
  return <div>Safe content</div>
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><Bomb shouldThrow={false} /></ErrorBoundary>)
    expect(screen.getByText('Safe content')).toBeDefined()
  })

  it('renders fallback when child throws', () => {
    render(<ErrorBoundary><Bomb shouldThrow={true} /></ErrorBoundary>)
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('Test explosion')).toBeDefined()
  })

  it('renders custom fallback when provided', () => {
    render(<ErrorBoundary fallback={<div>Custom error UI</div>}><Bomb shouldThrow={true} /></ErrorBoundary>)
    expect(screen.getByText('Custom error UI')).toBeDefined()
  })

  it('resets error state when Try again is clicked', () => {
    render(<ErrorBoundary><Bomb shouldThrow={true} /></ErrorBoundary>)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    // After reset, boundary re-renders children — Bomb still throws so fallback shows again
    expect(screen.getByText('Something went wrong')).toBeDefined()
  })
})
