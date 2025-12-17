import './App.css'
import MainTable from './features/MainTable'
import TransactionInput from './features/TransactionIInput'

function App() {
  return (
    <div className="h-screen bg-background">
      <div className='flex flex-col'>
        <h1 className='m-5 text-xl text-white'>Welcome!</h1>
        <div className='h-180 overflow-scroll static mx-5 w-2/3 rounded-md'>
          <MainTable />
        </div>
        <div className="m-5 w-2/3 rounded-md">
          <TransactionInput />
        </div>
      </div>
      {/* <div className="bg-red-200 w-1/3 p-4">Div 1</div> */}
    </div>
  )
}

export default App
