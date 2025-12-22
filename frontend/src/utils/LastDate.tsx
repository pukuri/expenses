export default function LastDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const lastMonth = now.getMonth() == 0 ? 11 : now.getMonth() - 1 
  const month = (lastMonth + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}