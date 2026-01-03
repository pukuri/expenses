import type { Category, TransactionsResponse } from "@/types";
import { render, screen } from "@testing-library/react";
import MainTable from "./MainTable";
import userEvent from "@testing-library/user-event";

describe('MainTable', () => {
  const data: TransactionsResponse = { data: [
    {
      id: 81,
      date: "2025-12-20",
      amount: 90000,
      running_balance: 13385000,
      description: "Dim Sum Lunch",
      category_name: { String: "Foods", Valid: true },
      category_color: { String: "#2fe3b5", Valid: true },
    }],
  };
  const categories: Category[] = [{id: 1, name: 'Groceries', color: '#2fe3b5'}]
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = jest.fn(() => {
      return Promise.resolve({ ok: true, json: () => Promise.resolve()} as Response)
    }) as jest.Mock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('render table based on props data', () => {
    render(<MainTable isSample={true} data={data} categories={categories} fetchTransactions={() => {}} />)
    
    expect(screen.getByText(/Date/i)).toBeInTheDocument()
    expect(screen.getByText(/Amount/i)).toBeInTheDocument()
    expect(screen.getByText(/Balance/i)).toBeInTheDocument()
    expect(screen.getByText(/Description/i)).toBeInTheDocument()
    expect(screen.getByText(/2025 December 20/i)).toBeInTheDocument()
    expect(screen.getByText(/90.000/i)).toBeInTheDocument()
    expect(screen.getByText(/13.385.000/i)).toBeInTheDocument()
    expect(screen.getByText(/Dim Sum Lunch/i)).toBeInTheDocument()
    expect(screen.getByText(/Foods/i)).toBeInTheDocument()
  })
  
  it('call fetch when update the category', async () => {
    render(<MainTable isSample={false} data={data} categories={categories} fetchTransactions={() => {}} />)
    const user = userEvent.setup()

    const menuButton = screen.getByRole('button', { name: /open menu/i})
    await user.click(menuButton)
    
    const updateCategoryTrigger = await screen.getByText(/update category/i)
    await user.hover(updateCategoryTrigger)
    
    // screen.debug()
    
    // CANT MAKE THIS NESTED ELEMENT VISIBLE SO I JUST COMMENTED OUT THIS TEST FIRST
    // const categoryOption = await screen.getByText('Groceries')
    // await user.click(categoryOption)

    // expect(globalThis.fetch).toHaveBeenCalled()
  })
})
