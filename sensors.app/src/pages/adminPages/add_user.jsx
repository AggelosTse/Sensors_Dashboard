import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

export function AddUser() {
  const navig = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    role: "",
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

    if (
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.email.trim() ||
      !formData.fullName.trim() ||
      !formData.role.trim()
    ) {
      setMessage("Missing Input");
      setMessageType("Error");
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
      setMessage(error);
      setMessageType("Error");
    }
  }

  return (
    <div>
      <AddUserField
        formData={formData}
        handleFormChange={handleFormChange}
        addSubmit={addSubmit}
        sending={sending}
      />

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function AddUserField({ formData, handleFormChange, addSubmit, sending }) {
  const [rolesList, setRolesList] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
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
      if (!formData.role) updateField("role", data[0]);
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
      {fields.map((field) => (
        <div key={field.name}>
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name]}
            onChange={(e) => handleFormChange(field.name, e.target.value)}
          />
          <br />
        </div>
      ))}

      <label htmlFor="userrole">ROLE</label>
      <br />

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
      <br />

      <button onClick={addSubmit} disabled={sending}>
        {sending ? "Sending..." : "ADD USER"}
      </button>
    </div>
  );
}

function ServerMessage({ message, messagetype }) {
  if (!message) return null;

  if (messagetype == "Error") {
    return <p className="statusMessageError">{message}</p>;
  } else {
    return <p className="statusMessageValid">{message}</p>;
  }
}
