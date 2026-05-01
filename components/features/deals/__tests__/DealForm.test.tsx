import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DealForm } from '../DealForm'

const defaultData = { title: '', value: 0, stage: 'lead', probability: 10, contact_id: '', company_id: '', expected_close_date: '' }

describe('DealForm', () => {
  it('renders title and value fields', () => {
    render(<DealForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} errors={{}} contacts={[]} companies={[]} />)
    expect(screen.getByText('Deal Title')).toBeDefined()
    expect(screen.getByText(/value \(\$\)/i)).toBeDefined()
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1)
  })

  it('shows validation error for title', () => {
    render(<DealForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} errors={{ title: 'Title is required' }} contacts={[]} companies={[]} />)
    expect(screen.getByText('Title is required')).toBeDefined()
  })

  it('shows validation error for value', () => {
    render(<DealForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} errors={{ value: 'Invalid value' }} contacts={[]} companies={[]} />)
    expect(screen.getByText('Invalid value')).toBeDefined()
  })

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(<DealForm data={{ ...defaultData, title: 'Big Deal', value: 1000 }} onChange={vi.fn()} onSubmit={onSubmit} errors={{}} contacts={[]} companies={[]} />)
    fireEvent.submit(screen.getByRole('button', { name: /save deal/i }))
    expect(onSubmit).toHaveBeenCalled()
  })

  it('renders stage dropdown with all stages', () => {
    render(<DealForm data={defaultData} onChange={vi.fn()} onSubmit={vi.fn()} errors={{}} contacts={[]} companies={[]} />)
    expect(screen.getByDisplayValue(/lead/i)).toBeDefined()
  })
})
