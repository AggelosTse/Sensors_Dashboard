import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../authContext";

export function EditUser() {
  const location = useLocation();
  const userdata = location.state;

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

  const navig = useNavigate();

  const { token } = useAuth();

  useEffect(() => {
    if (userdata) {
      getChosenUserData(userdata.id);
    }
  }, [userdata]);

  async function getChosenUserData(id) {
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
        password: data.password || "",
        email: data.email || "",
        fullName: data.fullName || "",
        role: data.role || "",
      });
    }
  }

  //function to update the formData object
  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  async function submitButton() {
    if (sending) return; //if true, button is already doing a task

    if (
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.email.trim() ||
      !formData.fullName.trim()
    ) {
      setMessage("Missing Input");
      setMessageType("Error");
      return;
    }
    setSending(true);

    const response = await fetch("http://localhost:8001/edituser", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userdata.id,
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
  }

  return (
    <div>
      <ChosenUserData formData={formData} onChange={handleFormChange} />

      <AvailableRoles
        currentRole={formData.role}
        setNewRole={(val) => handleFormChange("role", val)}
      />

      <button onClick={submitButton}>Update</button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function ChosenUserData({ formData, onChange }) {
  const fields = [
    { label: "username", type: "text" },
    { label: "password", type: "password" },
    { label: "email", type: "text" },
    { label: "fullName", type: "text" },
  ];

  return (
    <div>
      {fields.map((field) => (
        <div key={field.label}>
          <input
            type={field.type}
            placeholder={field.label}
            value={formData[field.label]}
            onChange={(e) => onChange(field.label, e.target.value)}
          />
          <br />
        </div>
      ))}
    </div>
  );
}

function AvailableRoles({ currentRole, setNewRole }) {
  const [availableRoles, setAvailableRoles] = useState([]);
  const { token } = useAuth();
 
  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  async function fetchAvailableRoles() {
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
  }

  return (
    <div style={{ margin: "15px 0" }}>
      <label>User Role: </label>
      <select value={currentRole} onChange={(e) => setNewRole(e.target.value)}>
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

  if (messagetype == "Error") {
    return <p className="statusMessageError">{message}</p>;
  } else {
    return <p className="statusMessageValid">{message}</p>;
  }
}
