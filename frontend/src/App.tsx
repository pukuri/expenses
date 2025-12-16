import './App.css'
import MainTable from './features/MainTable'
import TransactionInput from './features/TransactionIInput'

function App() {
  return (
    <div className="flex flex-row h-screen">
      <div className="bg-red-200 w-1/3 p-4">Div 1</div>
      <div className="bg-blue-200 w-2/3 overflow-scroll static">
        <MainTable />
        <TransactionInput />
      </div>
    </div>
  )
}

export default App
