import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";

export function LoginPage() {
  const navig = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  async function handleLogin() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (!formData.username.trim() || !formData.password.trim()) {
      setMessage("Missing Input");
      setMessageType("Error");
      setSending(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8001/loginValidation", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType(data.messagetype);

        login(data.token, data.role, formData.username);

        setTimeout(() => {
          setSending(false);
          navig("/control_panel");
        }, 2000);
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
      <h1>LOG IN</h1>

      <Fields formData={formData} handleFormChange={handleFormChange} />

      <TextForSignup sending={sending} />

      <button onClick={handleLogin} disabled={sending}>
        {sending ? "Processing..." : "Log In"}
      </button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function Fields({ formData, handleFormChange }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => handleFormChange("username", e.target.value)}
        style={{ boxSizing: "border-box" }}
      />{" "}
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={formData.password}
          onChange={(e) => handleFormChange("password", e.target.value)}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function TextForSignup({ sending }) {
  return (
    <div>
      <p>
        Dont Have an account?
        {sending ? (
          <span style={{ color: "gray", cursor: "not-allowed" }}>Sign up</span>
        ) : (
          <Link to="/signup">Sign up</Link>
        )}
      </p>
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
