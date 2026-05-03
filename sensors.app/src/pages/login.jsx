import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";


export function LoginPage() {
  const navig = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
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
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType(data.messagetype);

        login(data.token, data.role);

        setTimeout(() => {
          setSending(false);
          navig("/control_panel");
        }, 2000);
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
  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => handleFormChange("username", e.target.value)}
      />{" "}
      <br />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => handleFormChange("password",e.target.value)}
      />
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
