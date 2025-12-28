import { render, screen } from "@testing-library/react"
import CurrentMonthExpenses from "./CurrentMonthExpenses"

describe('CurrentBalance', () => {
  it('will return element for current > last', () => {
    const current = 2000
    const last = 1000

    render(<CurrentMonthExpenses currentAmount={current} lastAmount={last} />)
    
    expect(screen.getByText(/100%/i)).toBeInTheDocument()
    expect(screen.getByText(/Your expenses this month is higher than last month/i)).toBeInTheDocument()
    expect(screen.getByText(/2.000/i)).toBeInTheDocument()
  })

  it('will return element for current < last', () => {
    const current = 1000
    const last = 2000

    render(<CurrentMonthExpenses currentAmount={current} lastAmount={last} />)
    
    expect(screen.getByText(/-50%/i)).toBeInTheDocument()
    expect(screen.getByText(/Your expenses this month is lower than last month/i)).toBeInTheDocument()
    expect(screen.getByText(/1.000/i)).toBeInTheDocument()
  })

  it('will return element for current == last', () => {
    const current = 1000
    const last = 1000

    render(<CurrentMonthExpenses currentAmount={current} lastAmount={last} />)
    
    expect(screen.getByText(/0%/i)).toBeInTheDocument()
    expect(screen.getByText(/Your expenses this month is the same as last month/i)).toBeInTheDocument()
    expect(screen.getByText(/1.000/i)).toBeInTheDocument()
  })
})
