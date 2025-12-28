import { render, screen } from "@testing-library/react"
import userEvent from '@testing-library/user-event';
import TransactionInput from "./TransactionInput"
import type { Category } from "@/types"

describe('TransactionInput', () => {
  const categories: Category[] = [{id: 1, name: 'Foods', color: '#2fe3b5'}]
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = jest.fn(() => {
      return Promise.resolve({ ok: true, json: () => Promise.resolve()} as Response)
    }) as jest.Mock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('render form elements', () => {
    render(<TransactionInput categories={categories} isSample={true} fetchTransactions={() => {}}/>)
    
    expect(screen.getByText(/Select date/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Amount/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Description/i)).toBeInTheDocument()
    expect(screen.getByText(/Foods •/i)).toBeInTheDocument()
  })
  
  it('handle submit button', async () => {
    render(<TransactionInput categories={categories} isSample={false} fetchTransactions={() => {}}/>)
    const user = userEvent.setup()
    
    const dateButton = screen.getByText(/Select date/i)
    await user.click(dateButton)
    const todayDate = screen.getByRole('gridcell', { name: '1' })
    await user.click(todayDate)
    
    const amountInput = screen.getByPlaceholderText(/Amount/i)
    await user.type(amountInput, '100')
    
    const descriptionInput = screen.getByPlaceholderText(/Description/i)
    await user.type(descriptionInput, 'Test transaction')
    
    const categoryOption = screen.getByText(/Foods •/i)
    await user.click(categoryOption)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).toBeInTheDocument()
    
    await user.click(submitButton)

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/v1/transactions', {"body": "{\"amount\":100,\"description\":\"Test transaction\",\"category_id\":0,\"date\":\"\"}", "headers": {"Content-Type": "application/json"}, "method": "POST"})
  })
})
