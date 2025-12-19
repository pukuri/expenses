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

export default function MainTable({ data }: { data: TransactionsResponse }) {
  const theadClass = "border-b p-4 pt-4 pb-3 pl-4 text-left font-medium border-none text-gray-200"
  const tbodyClass = "border-b p-4 bg-neutral-2 border-bottom border-gray-700 text-gray-200"

  return (
    <div className="bg-neutral-1">
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="sticky top-0 bg-neutral-1">
          <tr>
            <th className={theadClass}>Date</th>
            <th className={theadClass}>Amount</th>
            <th className={theadClass}>Balance</th>
            <th className={theadClass}>Description</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800">
          {data.data.map((datum: Transaction) => (
            <tr key={datum.id}>
              <td className={tbodyClass}>{DateConverter(datum.date)}</td>
              <td className={tbodyClass}>{AmountFormatter(datum.amount)}</td>
              <td className={tbodyClass}>{AmountFormatter(datum.running_balance)}</td>
              <td className={tbodyClass}>
                {datum.category_name.String != '' && 
                  <span
                    style={{
                      border: `1px solid ${datum.category_color.String}`,
                      padding: '4px 6px',
                      borderRadius: '4px',
                      color: 'white',
                      marginRight: '10px'
                    }}
                  >
                    {datum.category_name.String} 
                  </span>
                }
                {datum.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
