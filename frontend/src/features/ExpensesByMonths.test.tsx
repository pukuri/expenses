import { render, screen } from "@testing-library/react"
import ExpensesByMonths from "./ExpensesByMonths"

jest.mock('@/components/ui/chart', () => ({
  ChartContainer: jest.fn(({children}) => (
    <div data-testid="cc-mock">{children}</div>
  )),
}))

jest.mock('recharts', () => ({
  BarChart: jest.fn(() => (
    <div data-testid="barchart-mock"></div>
  )),
}))

describe('ExpensesByMonths', () => {
  it('will render chart based on data', () => {
    const data = [
      { month: "2025-01", amount: 300 },
      { month: "2025-02", amount: 350 },
    ]

    render(<ExpensesByMonths data={data} />)

    expect(screen.getByText(/Expenses Comparison by Months/i)).toBeInTheDocument()
    
    expect(screen.getByTestId('cc-mock')).toBeInTheDocument()
    expect(screen.getByTestId('barchart-mock')).toBeInTheDocument()
  })
})
