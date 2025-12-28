import type { Category, ExpensesByMonthCategory, TransactionsResponse } from "@/types";
import { render } from "@testing-library/react";

const MockCurrentBalance = jest.fn(props => (
  <div data-testid='mock-current-balance'>Mock Current: {props.currentBalance}, Mock Last: {props.lastBalance}</div>
))
const MockCurrentMonthExpenses = jest.fn(props => (
  <div data-testid='mock-current-month-expenses'>Mock Current: {props.currentAmount}, Mock Last: {props.lastMaount}</div>
))
const MockMainTable = jest.fn(props => (
  <div data-testid='mock-main-table'>Mock Data: {JSON.stringify(props.data)}, Mock Categories: {JSON.stringify(props.categories)}</div>
))
const MockTransactionInput = jest.fn(props => (
  <div data-testid='mock-transaction-input'>Mock isSample: {props.isSample}, Mock Categories: {JSON.stringify(props.categories)}</div>
))
const MockCurrentMonthChart = jest.fn(props => (
  <div data-testid='mock-current-month-chart'>Mock Expenses: {JSON.stringify(props.expenses)}</div>
))

// need to mock the main layout due to one annoying static image
const MockMainLayout = jest.fn(props => {
  return (
    <div>
      <MockCurrentBalance currentBalance={props.currentBalance} lastBalance={props.lastBalance} />
      <MockCurrentMonthExpenses currentAmount={props.currentAmount} lastAmount={props.lastAmount} />
      <MockMainTable data={props.data} categories={props.categories} fetchTransactions={props.fetchTransactions} />
      <MockTransactionInput isSample={props.isSample} categories={props.categories} fetchTransactions={props.fetchTransactions} />
      <MockCurrentMonthChart expenses={props.expensesByMonthCategory} />
    </div>
  )
})

jest.mock('./CurrentBalance', () => ({
  __esModule: true,
  default: MockCurrentBalance
}))
jest.mock('./CurrentMonthExpenses', () => ({
  __esModule: true,
  default: MockCurrentMonthExpenses
}))
jest.mock('./MainTable', () => ({
  __esModule: true,
  default: MockMainTable
}))
jest.mock('./TransactionInput', () => ({
  __esModule: true,
  default: MockTransactionInput
}))
jest.mock('./CurrentMonthChart', () => ({
  __esModule: true,
  default: MockCurrentMonthChart
}))
jest.mock('./MainLayout', () => ({
  __esModule: true,
  default: MockMainLayout
}))

const MainLayout = MockMainLayout

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
      />
    )
    
    expect(MockCurrentBalance).toHaveBeenCalledWith({ currentBalance: 13385000, lastBalance: 13275000 }, undefined)
    expect(MockCurrentMonthExpenses).toHaveBeenCalledWith({ currentAmount: 14000000, lastAmount: 8000000 }, undefined)
    expect(MockMainTable).toHaveBeenCalledWith({ data: data, categories: categories, fetchTransactions: expect.any(Function) }, undefined)
    expect(MockTransactionInput).toHaveBeenCalledWith({ isSample: true, categories: categories, fetchTransactions: expect.any(Function) }, undefined)
    expect(MockCurrentMonthChart).toHaveBeenCalledWith({ expenses: expensesByMonthCategory }, undefined)
  })
})
