import "./App.css";
import { ProtectedRoute } from "./pages/adminPages/admincheck.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/login.jsx";
import { SignUpPage } from "./pages/signup.jsx";
import { ControlPanel } from "./pages/control_panel.jsx";
import { AddUser } from "./pages/adminPages/add_user.jsx";
import { EditUser } from "./pages/adminPages/edit_user.jsx";
import { AddSensors } from "./pages/adminPages/addSensor.jsx";
import { SensorMoreInfo } from "./pages/sensorMoreInfo.jsx";
import { EditSensor } from "./pages/adminPages/editSensor.jsx";
import { AuthProvider } from "./pages/authContext.jsx";


function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>

        <Route path="/" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/control_panel" element={<ControlPanel />} />
        <Route path="/sensorMoreInfo" element={<SensorMoreInfo />} />
        </Route>

        
        <Route element={<ProtectedRoute roleAllowed="admin" />}>
          <Route path="/add_user" element={<AddUser />} />
          <Route path="/edit_user" element={<EditUser />} />
          <Route path="/addSensor" element={<AddSensors />} />
          <Route path="/edit_sensor" element={<EditSensor />} />


        </Route>
          
          
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
