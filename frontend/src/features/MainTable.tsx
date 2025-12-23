import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AmountFormatter from "../utils/AmountFormatter"
import DateConverter from "../utils/DateConverter"
import { MoreVerticalIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Category, Transaction, TransactionsResponse } from "@/types";

interface MainTableProps {
  data: TransactionsResponse;
  categories: Category[];
  fetchTransactions: () => void;
}

export default function MainTable({ data, categories, fetchTransactions }: MainTableProps) {
  const updateCategory = async(id: number, category_id: number): Promise<void> => {
    const formData = { "category_id": category_id }
    try {
      const response = await fetch(`/api/v1/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      console.log('Success:', result);
      fetchTransactions()
    } catch(err) {
      console.error(err)
    }
  }

  return (
    <div>
      <Table className="static">
        <TableHeader className="bg-muted sticky top-0">
          <TableRow>
            <TableHead className="pl-4 text-foreground">Date</TableHead>
            <TableHead className="text-foreground">Amount</TableHead>
            <TableHead className="text-foreground">Balance</TableHead>
            <TableHead className="text-foreground">Description</TableHead>
            <TableHead className="text-foreground"></TableHead>
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
              <TableCell className="px-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" aria-label="Open menu" size="sm">
                      <MoreVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="" align="end">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Update Category</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          { categories.map((category) => (
                            <DropdownMenuItem key={category.id} onSelect={() => updateCategory(datum.id, category.id)}>{category.name}</DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
