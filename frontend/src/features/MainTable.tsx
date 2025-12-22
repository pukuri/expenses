import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  return (
    <div>
      <Table className="static">
        <TableHeader className="bg-muted sticky top-0">
          <TableRow>
            <TableHead className="pl-4 text-foreground">Date</TableHead>
            <TableHead className="text-foreground">Amount</TableHead>
            <TableHead className="text-foreground">Balance</TableHead>
            <TableHead className="text-foreground">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((datum: Transaction) => (
            <TableRow key={datum.id} className="text-foreground">
              <TableCell className="px-4">{DateConverter(datum.date)}</TableCell>
              <TableCell className="px-2">{AmountFormatter(datum.amount)}</TableCell>
              <TableCell className="px-2">{AmountFormatter(datum.running_balance)}</TableCell>
              <TableCell className="px-2">
                {datum.description}
                {datum.category_name.String != '' && 
                  <span
                    className="text-xs p-1 text-white ml-4"
                    style={{
                      border: `1px solid ${datum.category_color.String}`,
                      borderRadius: '4px',
                    }}
                  >
                    {datum.category_name.String} 
                  </span>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
