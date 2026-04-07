import "../styles/control_panel.css";

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
  if (userRole == "admin") {
    return <button>yo</button>;
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
