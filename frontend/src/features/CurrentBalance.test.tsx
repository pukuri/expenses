import { render, screen } from "@testing-library/react"
import CurrentBalance from "./CurrentBalance"

describe('CurrentBalance', () => {
  it('will return element for current > last', () => {
    const current = 2000
    const last = 1000

    render(<CurrentBalance currentBalance={current} lastBalance={last} />)
    
    expect(screen.getByText(/100%/i)).toBeInTheDocument()
    expect(screen.getByText(/Your current balance this date is higher than last month/i)).toBeInTheDocument()
    expect(screen.getByText(/2.000/i)).toBeInTheDocument()
  })

  it('will return element for current < last', () => {
    const current = 1000
    const last = 2000

    render(<CurrentBalance currentBalance={current} lastBalance={last} />)
    
    expect(screen.getByText(/-50%/i)).toBeInTheDocument()
    expect(screen.getByText(/Your current balance this date is lower than last month/i)).toBeInTheDocument()
    expect(screen.getByText(/1.000/i)).toBeInTheDocument()
  })

  it('will return element for current == last', () => {
    const current = 1000
    const last = 1000

    render(<CurrentBalance currentBalance={current} lastBalance={last} />)
    
    expect(screen.getByText(/0%/i)).toBeInTheDocument()
    expect(screen.getByText(/Your current balance this date is the same as last month/i)).toBeInTheDocument()
    expect(screen.getByText(/1.000/i)).toBeInTheDocument()
  })
})
