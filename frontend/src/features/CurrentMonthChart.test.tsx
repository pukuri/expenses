import { render, screen } from "@testing-library/react"
import CurrentMonthChart from "./CurrentMonthChart"

jest.mock('react-chartjs-2', () => ({
  Doughnut: jest.fn(props => (
    <div data-testid="doughnut-mock" {...props}></div>
  ))
}))

const { Doughnut } = jest.requireMock('react-chartjs-2')

describe('CurrentMonthChart', () => {

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('will render doughnut chart based on props data', () => {
    const data = [{
      id: 1,
      amount: 100,
      name: 'Foods',
      color: '#fff'
    }, {
      id: 2,
      amount: 200,
      name: 'Transports',
      color: '#000'
    }]
    
    render(<CurrentMonthChart expenses={data} />)
    
    const calledProps = Doughnut.mock.calls[0][0]
    
    expect(Doughnut).toHaveBeenCalled()
    expect(calledProps.data.labels).toEqual(['Foods', 'Transports'])
    expect(calledProps.data.datasets[0].data).toEqual([100, 200])
    expect(screen.getByTestId('doughnut-mock')).toBeInTheDocument()
  })
})
