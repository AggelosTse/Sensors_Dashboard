import "./App.css";
import { ProtectedRoute } from "./pages/adminPages/admincheck.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/login.jsx";
import { SignUpPage } from "./pages/signup.jsx";
import { ControlPanel } from "./pages/control_panel.jsx";
import { AddUser } from "./pages/adminPages/add_user.jsx";
import { EditUser } from "./pages/adminPages/edit_user.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/control_panel" element={<ControlPanel />} />

        <Route element={<ProtectedRoute roleAllowed="admin" />}>
          <Route path="/add_user" element={<AddUser />} />
          <Route path="/edit_user" element={<EditUser />} />

        </Route>
          
          
      </Routes>
    </Router>
  );
}

export default App;
