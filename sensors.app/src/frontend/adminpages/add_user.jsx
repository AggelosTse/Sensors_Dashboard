import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";

export function AddUser() {
  const navig = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: ""
  });

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const { token } = useAuth();

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  async function addSubmit() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (!formData.username.trim() || !formData.password.trim() || !formData.email.trim() || !formData.fullName.trim() || !formData.role.trim()) {
      setMessage("Missing Input");
      setMessageType("Error");
      setSending(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8001/adduser", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
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
      <AddUserFields
        formData={formData}
        handleFormChange={handleFormChange}
        setMessage={setMessage}
        setMessageType={setMessageType}
      />
      <button onClick={addSubmit} disabled={sending}>
        {sending ? "Sending..." : "ADD USER"}
      </button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function AddUserFields({ formData, handleFormChange, setMessage, setMessageType }) {
  const [rolesList, setRolesList] = useState([]);
  const [showPassword, setShowPassword] = useState(false); 
  const { token } = useAuth();

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
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
        setRolesList(data);

        if (data.length > 0 && !formData.role) {
          handleFormChange("role", data[0]);
        }
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("Error");
    }
  }

  const fields = [
    { name: "username", placeholder: "Username", type: "text" },
    { name: "password", placeholder: "Password", type: "password" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "fullName", placeholder: "Full Name", type: "text" },
  ];

  return (
    <div>
      {fields.map((field) => {
        
        if (field.name === "password") {
          return (
            <div key={field.name} className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={(e) => handleFormChange(field.name, e.target.value)}
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
          <div key={field.name}>
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={(e) => handleFormChange(field.name, e.target.value)}
              required={field.type === "email"}
              style={{ boxSizing: "border-box" }}
            />
          </div>
        );
      })}

      <label htmlFor="userrole">ROLE</label>
      <select
        id="userrole"
        value={formData.role}
        onChange={(e) => handleFormChange("role", e.target.value)}
      >
        {rolesList.map((role) => (
          <option key={role} value={role}>
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
