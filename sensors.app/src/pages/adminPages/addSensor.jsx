import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";

export function AddSensors() {

  const [formData, setFormData] = useState({
    name: "",
    metadata: "",
    category: ""
  });

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");
  const [sending, setSending] = useState(false); //to prevent spamming button
  const { token } = useAuth();
  const navig = useNavigate();

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  async function handleAddSensor() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (!formData.name.trim() || !formData.metadata.trim()) {
      setMessage("Missing Input");
      setMessageType("Failure");
      setSending(false);
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
          name: formData.name,
          metadata: formData.metadata,
          category: formData.category
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
      <AddSensorFields
        formData={formData}
        handleFormChange={handleFormChange}
        setMessage={setMessage}
        setMessageType={setMessageType}
        sending={sending}
      />

      <button onClick={handleAddSensor} disabled={sending}>
        {sending ? "Sending..." : "ADD SENSOR"}
      </button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function AddSensorFields({ formData, handleFormChange, setMessage, setMessageType, sending }) {

  const [categoryList, setCategoryList] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {

    try {
      const response = await fetch("http://localhost:8001/getSensorCategories", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCategoryList(data);

        if (data.length > 0 && !formData.category) {
          handleFormChange("category", data[0]);
        }
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("Error");
    }
  }

  const fields = [
    { name: "name", placeholder: "name", type: "text" },
    { name: "metadata", placeholder: "metadata", type: "text" }
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
        id="category"
        value={formData.category}
        onChange={(e) => handleFormChange("category", e.target.value)}
      >
        {categoryList.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <br />
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