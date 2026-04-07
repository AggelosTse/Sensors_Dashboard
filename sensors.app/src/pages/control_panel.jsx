import "../styles/control_panel.css";

import { useNavigate } from "react-router-dom";

export function ControlPanel() {
  const role = localStorage.getItem("role");
  console.log(`2. ${role}`);
  return (
    <div>
      <Boxes />
      <AdminButton userRole={role} />
    </div>
  );
}

function AdminButton({ userRole }) {
    const navig = useNavigate();
  if (userRole == "admin") {
    return <button 
                onClick={()=>navig("/admin_panel")}>yo
           </button>;
  }
  return null;
}


function Boxes() {
  return (
    <div className="boxes-container">
      <div className="boxes">Box 1 </div>
      <div className="boxes">Box 1 </div>

      <div className="boxes">Box 1 </div>
    </div>
  );
}
