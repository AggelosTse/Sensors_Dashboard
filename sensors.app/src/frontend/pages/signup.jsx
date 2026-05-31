import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";

export function SignUpPage() {

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
  });

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const navig = useNavigate();

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSignUp() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (!formData.username.trim() || !formData.password.trim() || !formData.email.trim() || !formData.fullName.trim()) {
      setMessage("Missing Input");
      setMessageType("Error");
      setSending(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8001/signUp", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setMessageType(data.messagetype);

        // if token exists after sign up, you automatically log in
        if (data.token) {
          login(data.token, data.role, formData.username);
        }

        setTimeout(() => {
          setSending(false);
          navig("/control_panel");
        }, 2200);
      }
      else {
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
      <h1>SIGN UP</h1>
      <Fields formData={formData} handleFormChange={handleFormChange} />

      <button onClick={handleSignUp} disabled={sending}>
        {sending ? "Processing..." : "Sign Up"}
      </button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function Fields({ formData, handleFormChange }) {
  const [showPassword, setShowPassword] = useState(false);

  const fields = [
    { name: "username", type: "text", placeholder: "Username" },
    { name: "password", type: "password", placeholder: "Password" },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "fullName", type: "text", placeholder: "Full Name" },
  ];

  return (
    <div>
      {fields.map((f) => {
        if (f.name === "password") {
          return (
            <div key={f.name} className="password-wrapper">
              <input
                name={f.name}
                type={showPassword ? "text" : "password"}
                placeholder={f.placeholder}
                value={formData[f.name]}
                onChange={(e) => handleFormChange(f.name, e.target.value)}
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
          <div key={f.name}>
            <input
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              value={formData[f.name]}
              onChange={(e) => handleFormChange(f.name, e.target.value)}
              required={f.type === "email"}
              style={{ boxSizing: "border-box" }} 
            />
          </div>
        );
      })}
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
