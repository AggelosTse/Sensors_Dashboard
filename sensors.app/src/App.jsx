import "./App.css";
import {ProtectedRoute} from "./admincheck.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./frontend/pages/login.jsx";
import { SignUpPage } from "./frontend/pages/signup.jsx";
import { ControlPanel } from "./frontend/pages/control_panel.jsx";
import { AddUser } from "./frontend/adminpages/add_user.jsx";
import { EditUser } from "./frontend/adminpages/edit_user.jsx";
import { AddSensors } from "./frontend/adminpages/add_sensor.jsx";
import { SensorMoreInfo } from "./frontend/pages/sensorMoreInfo.jsx";
import { EditSensor } from "./frontend/adminpages/edit_sensor.jsx";
import { AuthProvider } from "./context/authContext.jsx";

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
