import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../authContext";

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

  //function to update the formData object
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

      <button onClick={submitButton}>
        {sending ? "Sending..." : "EDIT USER"}
      </button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function ChosenUserData({ formData, handleFormChange }) {
  const fields = [
    { label: "username", type: "text" },
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
            onChange={(e) => handleFormChange(field.label, e.target.value)}
          />
          <br />
        </div>
      ))}
    </div>
  );
}

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
