import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import {LoginPage} from './pages/login.jsx';

import {SignUpPage} from './pages/signup.jsx';

import {ControlPanel} from './pages/control_panel.jsx';

function App() {
  return (
  
      <Router>
        <Routes>
          
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/control_panel" element={<SignUpPage />} />
        </Routes>
      </Router>
   
  );
}

export default App
