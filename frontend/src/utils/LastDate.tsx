export default function LastDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const lastMonth = now.getMonth() == 0 ? 11 : now.getMonth() - 1 
  const month = (lastMonth + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  
  // Adjust year if we went back to previous year (January -> December)
  const lastYear = now.getMonth() == 0 ? year - 1 : year
  
  return `${lastYear}-${month}-${day}`
}
