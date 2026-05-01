import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContactForm } from '../ContactForm'

const defaultData = { name: '', email: '', phone: '', company_id: '', status: 'lead', tags: [] }

describe('ContactForm', () => {
  it('renders name and email fields', () => {
    render(<ContactForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} onCancel={vi.fn()} errors={{}} companies={[]} tags={[]} editingId={null} />)
    // Labels exist as visible text
    expect(screen.getByText('Name')).toBeDefined()
    expect(screen.getByText('Email')).toBeDefined()
    // Inputs are present
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(2)
  })

  it('shows validation error for name', () => {
    render(<ContactForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} onCancel={vi.fn()} errors={{ name: 'Name is required' }} companies={[]} tags={[]} editingId={null} />)
    expect(screen.getByText('Name is required')).toBeDefined()
  })

  it('shows validation error for email', () => {
    render(<ContactForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} onCancel={vi.fn()} errors={{ email: 'Invalid email format' }} companies={[]} tags={[]} editingId={null} />)
    expect(screen.getByText('Invalid email format')).toBeDefined()
  })

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(<ContactForm data={{ ...defaultData, name: 'Alice', email: 'alice@example.com' }} onChange={vi.fn()} onSubmit={onSubmit} onCancel={vi.fn()} errors={{}} companies={[]} tags={[]} editingId={null} />)
    fireEvent.submit(screen.getByRole('button', { name: /save contact/i }))
    expect(onSubmit).toHaveBeenCalled()
  })

  it('shows Update Contact button when editingId is set', () => {
    render(<ContactForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} onCancel={vi.fn()} errors={{}} companies={[]} tags={[]} editingId="abc" />)
    expect(screen.getByRole('button', { name: /update contact/i })).toBeDefined()
  })

  it('shows Cancel button when editingId is set', () => {
    render(<ContactForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} onCancel={vi.fn()} errors={{}} companies={[]} tags={[]} editingId="abc" />)
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined()
  })
})
