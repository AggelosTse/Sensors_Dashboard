import "./App.css";
import { ProtectedRoute } from "./pages/adminPages/admincheck.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/login.jsx";
import { SignUpPage } from "./pages/signup.jsx";
import { ControlPanel } from "./pages/control_panel.jsx";
import { AdminPanel } from "./pages/adminPages/admin_panel.jsx";
import {EditSensors} from "./pages/adminPages/edit_sensors.jsx";
import { EditUsers } from "./pages/adminPages/edit_users.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/control_panel" element={<ControlPanel />} />

        <Route element={<ProtectedRoute roleAllowed="admin" />}>
          <Route path="/admin_panel" element={<AdminPanel />} />
          <Route path="/edit_sensors" element={<EditSensors />} />
          <Route path="/edit_users" element={<EditUsers />} />
        </Route>
          
          
      </Routes>
    </Router>
  );
}

export default App;
