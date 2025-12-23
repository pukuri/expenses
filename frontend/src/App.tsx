import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import Sample from './pages/Sample';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sample" element={<Sample />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
