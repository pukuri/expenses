import { render, screen } from "@testing-library/react"
import ExpensesByMonths from "./ExpensesByMonths"


jest.mock('@/components/ui/chart', () => ({
  ChartContainer: jest.fn(props => (
    <div data-testid="cc-mock" {...props}></div>
  )),
  ChartTooltip: jest.fn(props => (
    <div data-testid="ctt-mock" {...props}></div>
  )),
  ChartTooltipContent: jest.fn(props => (
    <div data-testid="cttc-mock" {...props}></div>
  )),
}))

jest.mock('recharts', () => ({
  Bar: jest.fn(props => (
    <div data-testid="bar-mock" {...props}></div>
  )),
  BarChart: jest.fn(props => (
    <div data-testid="barchart-mock" {...props}></div>
  )),
  CartesianGrid: jest.fn(props => (
    <div data-testid="carts-mock" {...props}></div>
  )),
  XAxis: jest.fn(props => (
    <div data-testid="xaxis-mock" {...props}></div>
  )),
}))

const { Bar, BarChart, CartesianGrid, XAxis } = jest.requireMock('recharts')
const { ChartContainer, ChartTooltip } = jest.requireMock('@/components/ui/chart')

describe('ExpensesByMonths', () => {
  it('will render chart based on data', () => {
    const data = [
      { month: "2025-01", amount: 300 },
      { month: "2025-02", amount: 350 },
    ]

    render(<ExpensesByMonths data={data} />)

    expect(screen.getByText(/Expenses Comparison by Months/i)).toBeInTheDocument()

    expect(Bar).toHaveBeenCalled()
    expect(BarChart).toHaveBeenCalled()
    expect(CartesianGrid).toHaveBeenCalled()
    expect(XAxis).toHaveBeenCalled()
    expect(ChartContainer).toHaveBeenCalled()
    expect(ChartTooltip).toHaveBeenCalled()
  })
})