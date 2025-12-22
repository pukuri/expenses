import { useEffect, useState, type SetStateAction } from "react";
import AmountFormatter from "../utils/AmountFormatter";
import { Badge } from "@/components/ui/badge";
import PercentageBadge from "@/components/percentageBadge";
import TodayDate from "@/utils/TodayDate";
import LastDate from "@/utils/LastDate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category { 
  id: number | undefined; 
  name: string; 
}

export default function ExpensesByMonthCategory() {
  const [currentAmount, setCurrentAmount] = useState<number>(0)
  const [lastAmount, setLastAmount] = useState<number>(0)
  const [categoryNames, setCategoryNames] = useState<Category[]>([ {id: 0, name: 'Uncategorized'} ])
  
  const fetchCategories = async (): Promise<void> => {
    const response = await fetch("/api/v1/categories")
    try {
      if(!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      setCategoryNames(result.data)
    } catch (err) {
      console.error(err)
    }
  }
  
  const handleCategoryChange = async (value: string): Promise<void> => {
    await fetchCurrentAmount(parseInt(value)).catch(console.error)
    await fetchLastAmount(parseInt(value)).catch(console.error)
  }
  
  const fetchAmount = async (dateParams: string, catId: number, callback: { (value: SetStateAction<number>): void; }): Promise<void> => {
    try {
      const response = await fetch("/api/v1/expenses_by_month_category?" + new URLSearchParams({
        date: dateParams,
        category_id: JSON.stringify(catId)
      }))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      callback(result.data.amount)
    } catch (err) {
      console.log(err)
    }
  }
  
  const fetchCurrentAmount = async (catId: number): Promise<void> => {
    const dateParams = TodayDate()
    await fetchAmount(dateParams, catId, setCurrentAmount)
  }
  
  const fetchLastAmount = async(catId: number): Promise<void> => {
    const dateParams = LastDate()
    await fetchAmount(dateParams, catId, setLastAmount)
  }
  
  useEffect(() => {
    fetchCategories()
    if (categoryNames[0].id) {
      fetchCurrentAmount(categoryNames[0].id).catch(console.error)
      fetchLastAmount(categoryNames[0].id).catch(console.error)
    }
  }, []);

  const renderBadgeSub = () => {
    if (currentAmount > lastAmount) {
      return <p className="text-xs text-chart-1">Your expenses this month is higher than last month</p>
    } else if (currentAmount < lastAmount) {
      return <p className="text-xs text-chart-1">Your expenses this month is lower than last month</p>
    } else {
      return <p className="text-xs text-chart-1">Your expenses this month is the same as last month</p>
    }
  }
  
  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <div className="flex flex-row justify-between mb-4">
        <p>This Month Expenses by Category</p>
        <Badge
          variant="secondary"
          className="bg-primary text-white font-medium text-xs"
        > 
          <PercentageBadge current={currentAmount} last={lastAmount} />
        </Badge>
      </div>
      {renderBadgeSub()}
      <div className="flex flex-row justify-between mt-2">
        <h1 className="text-4xl font-bold">{AmountFormatter(currentAmount)}</h1>
        <Select onValueChange = {(value) => handleCategoryChange(value)} >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Categories" />
          </SelectTrigger>
          <SelectContent>
            { categoryNames.map((category, index) => (
              <SelectItem key={index} value={JSON.stringify(category.id)}>{category.name}</SelectItem>
            )) }
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}