import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../authContext";

export function AddSensors() {
  const [formData, setFormData] = useState({
    name: "",
    metadata: "",
    category: "Humidity",
  });

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const navig = useNavigate();

  const { token } = useAuth();

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  async function handleAddSensor() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (!formData.name.trim() || !formData.metadata.trim()) {
      setMessage("Missing Input");
      setMessageType("Failure");
      return;
    }

    try {
      const response = await fetch("http://localhost:8001/addsensor", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          metadata: metadata,
          category: category,
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
      <Fields
        formData={formData}
        handleFormChange={handleFormChange}
        handleAddSensor={handleAddSensor}
        sending={sending}
      />
      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function Fields({ formData, handleFormChange, handleAddSensor, sending }) {
  const fields = [
    { name: "name", type: "text", placeholder: "Name" },
    { name: "metadata", type: "text", placeholder: "Metadata" },
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

      <label htmlFor="sensortype">Categories</label>
      <br />
      <select
        id="CATEGORY"
        value={formData.category}
        onChange={(e) => handleFormChange("category", e.target.value)}
      >
        {rolesList.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <br />

      <button onClick={handleAddSensor} disabled={sending}>
        {sending ? "Sending..." : "ADD SENSOR"}
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
