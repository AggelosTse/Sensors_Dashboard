import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/login.jsx";
import { SignUpPage } from "./pages/signup.jsx";
import { ControlPanel } from "./pages/control_panel.jsx";
import { AdminPanel } from "./pages/admin_panel.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/control_panel" element={<ControlPanel />} />
        <Route path="/admin_panel" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
