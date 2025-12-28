
import PercentageBadge from "@/components/percentageBadge"
import { render, screen } from "@testing-library/react"

describe('PercentageBadge', () => {
  it('will return element for current > last', () => {
    const current = 200
    const last = 100

    render(<PercentageBadge current={current} last={last} />)
    
    const textElement = screen.getByText(/100%/i)
    expect(textElement).toBeInTheDocument()
  })
  
  it('will return element for current < last', () => {
    const current = 100
    const last = 200

    render(<PercentageBadge current={current} last={last} />)
    
    const textElement = screen.getByText(/-50%/i)
    expect(textElement).toBeInTheDocument()
  })

  it('will return element for current == last', () => {
    const current = 100
    const last = 100

    render(<PercentageBadge current={current} last={last} />)
    
    const textElement = screen.getByText(/0%/i)
    expect(textElement).toBeInTheDocument()
  })
})