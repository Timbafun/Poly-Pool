import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './components/AuthManager'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import CadastroPage from './pages/CadastroPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <nav style={{ padding: '15px', backgroundColor: '#343a40', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>PoolPoly</span>
            <div>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: '20px' }}>Início</Link>
                <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<CadastroPage />} /> 
          <Route path="/cadastro" element={<CadastroPage />} />
          
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute element={DashboardPage} />} 
          />
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;