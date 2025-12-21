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
              <TableCell className="p-4">{DateConverter(datum.date)}</TableCell>
              <TableCell className="p-4">{AmountFormatter(datum.amount)}</TableCell>
              <TableCell className="p-4">{AmountFormatter(datum.running_balance)}</TableCell>
              <TableCell className="p-4">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
