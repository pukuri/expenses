import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DashboardTable from './pages/DashboardTable';
import DashboardSummary from './pages/DashboardSummary';
import SampleTable from './pages/SampleTable';
import SampleSummary from './pages/SampleSummary';
import Story from './pages/Story';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<DashboardTable />} />
          <Route path="/dashboard/summary" element={<DashboardSummary />} />
          <Route path="/sample" element={<SampleTable />} />
          <Route path="/sample/summary" element={<SampleSummary />} />
          <Route path="/story" element={<Story />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
