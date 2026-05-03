import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";
import "../index.css";

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
          login(data.token, data.role);
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
        {issending ? "Processing..." : "Sign Up"}
      </button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function Fields({ formData, handleFormChange }) {

  const fields = [
    { name: "username", type: "text", placeholder: "Username" },
    { name: "password", type: "password", placeholder: "Password" },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "fullName", type: "text", placeholder: "Full Name" },
  ];

  return (
    <div>
      {fieldConfigs.map((f) => (
        <div key={f.name}>
          <input
            name={f.name}
            type={f.type}
            placeholder={f.placeholder}
            value={formData[f.name]}
            onChange={(e) => handleFormChange(field.label, e.target.value)}
            required={field.type === "email" || ""}
          />
          <br />
        </div>
      ))}
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
