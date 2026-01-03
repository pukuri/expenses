import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Sample from './pages/Sample';
import Story from './pages/Story';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sample" element={<Sample />} />
          <Route path="/story" element={<Story />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
