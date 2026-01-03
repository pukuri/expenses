import type { Category, ExpensesByMonthCategory, MonthlyChartData, TransactionsResponse } from "@/types";
import { render, screen } from "@testing-library/react";
import MainLayout from "./MainLayout";

jest.mock('./CurrentBalance', () => ({
  __esModule: true,
  default: jest.fn(props => (
    <div data-testid='mock-current-balance'>Mock Current: {props.currentBalance}, Mock Last: {props.lastBalance}</div>
  )),
}))
jest.mock('./CurrentMonthExpenses', () => ({
  __esModule: true,
  default: jest.fn(props => (
    <div data-testid='mock-current-month-expenses'>Mock Current: {props.currentAmount}, Mock Last: {props.lastAmount}</div>
  )),
}))
jest.mock('./MainTable', () => ({
  __esModule: true,
  default: jest.fn(props => (
    <div data-testid='mock-main-table'>Mock Data: {JSON.stringify(props.data)}, Mock Categories: {JSON.stringify(props.categories)}</div>
  )),
}))
jest.mock('./TransactionInput', () => ({
  __esModule: true,
  default: jest.fn(props => (
    <div data-testid='mock-transaction-input'>Mock isSample: {props.isSample}, Mock Categories: {JSON.stringify(props.categories)}</div>
  )),
}))
jest.mock('./CurrentMonthChart', () => ({
  __esModule: true,
  default: jest.fn(props => (
    <div data-testid='mock-current-month-chart'>Mock Expenses: {JSON.stringify(props.expenses)}</div>
  )),
}))
jest.mock('./ExpensesByMonths', () => ({
  __esModule: true,
  default: jest.fn(props => (
    <div data-testid='mock-expenses-by-month'>Mock Data: {JSON.stringify(props.data)}</div>
  )),
}))

describe('MainLayout', () => {
  afterEach(() => {
    jest.clearAllMocks()  
  })
  
  it('will render elements with props', () => {
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
    const categories: Category[] = [{id: 1, name: 'Foods', color: '#2fe3b5'}]
    const expensesByMonthCategory: ExpensesByMonthCategory[] = [{id: 1, name: 'Foods', color: '#2fe3b5', amount: 2000000}]
    const monthlyChartData: MonthlyChartData[] = [{month: '2025-12-01', amount: 2000000}]

    render(
      <MainLayout
        data={data}
        categories={categories}
        isSample={true}
        currentAmount={14000000}
        lastAmount={8000000}
        currentBalance={data.data[0].running_balance}
        lastBalance={13275000}
        fetchTransactions={() => {}}
        expensesByMonthCategory={expensesByMonthCategory}
        monthlyChartData={monthlyChartData}
      />
    )
    
    expect(screen.getByTestId('mock-current-balance')).toBeInTheDocument()
    expect(screen.getByText(/Mock Current: 13385000/i)).toBeInTheDocument()
    expect(screen.getByText(/Mock Last: 13275000/i)).toBeInTheDocument()

    expect(screen.getByTestId('mock-current-month-expenses')).toBeInTheDocument()
    expect(screen.getByText(/Mock Current: 14000000/i)).toBeInTheDocument()
    expect(screen.getByText(/Mock Last: 8000000/i)).toBeInTheDocument()

    expect(screen.getByTestId('mock-expenses-by-month')).toBeInTheDocument()
    expect(screen.getByText(`Mock Data: [{"month":"2025-12-01","amount":2000000}]`)).toBeInTheDocument()

    expect(screen.getByTestId('mock-main-table')).toBeInTheDocument()
    expect(screen.getByTestId('mock-transaction-input')).toBeInTheDocument()

    expect(screen.getByTestId('mock-current-month-chart')).toBeInTheDocument()
    expect(screen.getByText(`Mock Expenses: [{"id":1,"name":"Foods","color":"#2fe3b5","amount":2000000}]`)).toBeInTheDocument()
  })
})
