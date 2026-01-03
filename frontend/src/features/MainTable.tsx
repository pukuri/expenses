import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AmountFormatter from "../utils/AmountFormatter"
import DateConverter from "../utils/DateConverter"
import { MoreVerticalIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Category, Transaction, TransactionsResponse } from "@/types";
import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface MainTableProps {
  isSample: boolean;
  data: TransactionsResponse;
  categories: Category[];
  fetchTransactions: () => void;
}

export default function MainTable({ isSample, data, categories, fetchTransactions }: MainTableProps) {
  const [showDescriptionDialog, setShowDescriptionDialog] = useState<boolean>(false)
  const [showAmountDialog, setShowAmountDialog] = useState<boolean>(false)
  const [modalDescription, setModalDescription] = useState<string>('')
  const [modalAmount, setModalAmount] = useState<number>(0)
  const [modalId, setModalId] = useState<number>(0)
  
  const openDescriptionModal = (id: number, description: string) => {
    setShowDescriptionDialog(true)
    setModalDescription(description)
    setModalId(id)
  }

  const openAmountModal = (id: number, amount: number) => {
    setShowAmountDialog(true)
    setModalAmount(amount)
    setModalId(id)
  }
  
  const fetchUpdate = async(e: FormEvent | null, id: number, formData: { [key: string]: string | number}): Promise<void> => {
    e?.preventDefault()

    if(isSample) return

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

  const updateDescription = async(e: FormEvent): Promise<void> => {
    if(isSample) return

    const formData = { "description": modalDescription }
    fetchUpdate(e, modalId, formData)
    setShowDescriptionDialog(false)
  }

  const updateAmount = async(e: FormEvent): Promise<void> => {
    if(isSample) return

    const formData = { "amount": modalAmount }
    fetchUpdate(e, modalId, formData)
    setShowAmountDialog(false)
  }
  
  const updateCategory = async(id: number, category_id: number): Promise<void> => {
    if(isSample) return

    const formData = { "category_id": category_id }
    fetchUpdate(null, id, formData)
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
                    <DropdownMenuItem onSelect={() => openDescriptionModal(datum.id, datum.description) }>Update Description</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => openAmountModal(datum.id, datum.amount) }>Update Amount</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Update Category</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          { categories.map((category) => (
                            <DropdownMenuItem 
                              key={category.id} 
                              onSelect={() => updateCategory(datum.id, category.id)}
                            >
                              {category.name}
                            </DropdownMenuItem>
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
      
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent>
          <DialogTitle>Change Transaction Description</DialogTitle>
          <form className="flex flex-row gap-2" onSubmit={updateDescription}>
            <Input id="description" name="description" placeholder={modalDescription} className="w-4/5" onChange={(e) => setModalDescription(e.target.value)} />
            <Button type="submit" variant="outline" aria-label="Submit" name="Submit" className="bg-primary w-1/5">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAmountDialog} onOpenChange={setShowAmountDialog}>
        <DialogContent>
          <DialogTitle>Change Transaction Amount</DialogTitle>
          <form className="flex flex-row gap-2" onSubmit={updateAmount}>
            <Input id="description" name="description" placeholder={JSON.stringify(modalAmount)} className="w-4/5" onChange={(e) => setModalAmount(Number(e.target.value)| 0)} />
            <Button type="submit" variant="outline" aria-label="Submit" name="Submit" className="bg-primary w-1/5">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
