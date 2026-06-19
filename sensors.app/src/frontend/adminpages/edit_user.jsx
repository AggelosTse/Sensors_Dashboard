import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";

export function EditUser() {
  const location = useLocation();
  const userdata = location.state;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: ""
  });

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const navig = useNavigate();

  const { token } = useAuth();

  //when website renders, get user data. If user data change, run again
  useEffect(() => {
    if (userdata) {
      getChosenUserData(userdata.id);
    }
  }, [userdata]);

  async function getChosenUserData(id) {
    try {
      const response = await fetch(
        `http://localhost:8001/getChosenUserData?id=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setFormData({
          username: data.username || "",
          email: data.email || "",
          fullName: data.fullName || "",
          role: data.role || "",
        });
      }
    } catch (error) {
      setMessage(error);
      setMessageType("Error");
    }
  }

  //function to update the formData object dinamically
  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  async function submitButton() {
    if (sending) return; //if true, button is already doing a task

    if (!formData.username.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      setMessage("Missing Input");
      setMessageType("Error");
      setSending(false);
      return;
    }
    setSending(true);

    try {
      const response = await fetch("http://localhost:8001/edituser", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userdata.id,
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType(data.messagetype);

        setTimeout(() => {
          setSending(false);
          navig("/control_panel");
        }, 2200);
      } else {
        setMessage(data.message);
        setMessageType(data.messagetype);
        setSending(false);
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("Error");
      setSending(false);
    }
  }

  return (
    <div>
      <ChosenUserData formData={formData} handleFormChange={handleFormChange} />

      <AvailableRoles
        currentRole={formData.role}
        handleFormChange={handleFormChange}
        setMessage={setMessage}
        setMessageType={setMessageType}
      />

      <button onClick={submitButton} disabled={sending}>
        {sending ? "Sending..." : "EDIT USER"}
      </button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

//user data fields
function ChosenUserData({ formData, handleFormChange }) {
  const [showPassword, setShowPassword] = useState(false); 

  const fields = [
    { label: "username", type: "text", placeholder: "Username" },
    { label: "password", type: "password", placeholder: "Password" },
    { label: "email", type: "email", placeholder: "Email" },
    { label: "fullName", type: "text", placeholder: "Full Name" },
  ];

  //make evry fields element a widget
  return (
    <div>
      {fields.map((field) => {
       
        if (field.label === "password") {
          return (
            <div key={field.label} className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={field.placeholder}
                value={formData[field.label]}
                onChange={(e) => handleFormChange(field.label, e.target.value)}
              />
              <button 
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                 
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          );
        }

        return (
          <div key={field.label}>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.label]}
              onChange={(e) => handleFormChange(field.label, e.target.value)}
              required={field.type === "email"}
              style={{ boxSizing: "border-box" }}
            />
          </div>
        );
      })}
    </div>
  );
}

//user roles selection bar
function AvailableRoles({ currentRole, handleFormChange, setMessage, setMessageType }) {
  const [availableRoles, setAvailableRoles] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  async function fetchAvailableRoles() {

    try {
      const response = await fetch("http://localhost:8001/getUserRoles", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setAvailableRoles(data);
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("Error");
    }
  }

  return (
    <div style={{ margin: "15px 0" }}>
      <label>User Role: </label>
      <select value={currentRole} onChange={(e) => handleFormChange("role", e.target.value)}>
        {availableRoles.map((role, index) => (
          <option key={index} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );
}

function ServerMessage({ message, messagetype }) {
  if (!message) return null;

  if (messagetype === "Error") {
    return <p className="statusMessageError">{message}</p>;
  } else {
    return <p className="statusMessageValid">{message}</p>;
  }
}
