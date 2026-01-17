import { render, screen } from "@testing-library/react"
import ExpensesLast30Days from "./ExpensesLast30Days"

const mockData = [
  {
    date: "2024-01-15",
    amount: 250.50
  },
  {
    date: "2024-01-16", 
    amount: 130.25
  },
  {
    date: "2024-01-17",
    amount: 450.00
  }
]

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

describe('ExpensesLast30Days', () => {
  it('renders component with data', () => {
    render(<ExpensesLast30Days data={mockData} />)
    
    expect(screen.getByText('Last 30 Days Expenses Breakdown')).toBeInTheDocument()
  })

  it('renders component with empty data', () => {
    render(<ExpensesLast30Days data={[]} />)
    
    expect(screen.getByText('Last 30 Days Expenses Breakdown')).toBeInTheDocument()
  })
})
