import { useEffect, useState } from "react"
import AmountFormatter from "../utils/AmountFormatter"
import DateConverter from "../utils/DateConverter"

interface NullString {
  String: string;
  Valid: boolean;
}

interface Transaction {
  id: number;
  date: string;
  amount: number;
  running_balance: number;
  description: string;
  category_name: NullString;
  category_color: NullString;
}

interface TransactionsResponse {
  data: Transaction[];
}

const fetchData = async (): Promise<TransactionsResponse> => {
  const response = await fetch("/api/v1/transactions")
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const result = await response.json()
  return result
}

export default function MainTable() {
  const [data, setData] = useState<TransactionsResponse>({ data: [] })
  useEffect(() => {
    fetchData().then(setData).catch(console.error);
  }, []);

  const theadClass = "border-b p-4 pt-0 pb-3 pl-4 text-left font-medium border-none text-gray-200"
  const tbodyClassOdd = "border-b p-4 bg-neutral-1 border-none text-gray-200"
  const tbodyClassEven = "border-b p-4 bg-neutral-2 border-none text-gray-200"

  return (
    <div className="pt-4 bg-neutral-1">
      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr>
            <th className={theadClass}>Date</th>
            <th className={theadClass}>Amount</th>
            <th className={theadClass}>Balance</th>
            <th className={theadClass}>Description</th>
            <th className={theadClass}>Category</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800">
          {data.data.map((datum: Transaction, index: number) => (
            <tr key={datum.id}>
              <td className={index%2 == 0 ? tbodyClassEven : tbodyClassOdd}>{DateConverter(datum.date)}</td>
              <td className={index%2 == 0 ? tbodyClassEven : tbodyClassOdd}>{AmountFormatter(datum.amount)}</td>
              <td className={index%2 == 0 ? tbodyClassEven : tbodyClassOdd}>{AmountFormatter(datum.running_balance)}</td>
              <td className={index%2 == 0 ? tbodyClassEven : tbodyClassOdd}>{datum.description}</td>
              <td className={index%2 == 0 ? tbodyClassEven : tbodyClassOdd}>
                {datum.category_name.String != '' && 
                  <span
                    style={{
                      border: `1px solid ${datum.category_color.String}`,
                      padding: '8px 12px',
                      borderRadius: '4px',
                      color: 'white'
                    }}
                  >
                    {datum.category_name.String}
                  </span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
