import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../authContext";

export function EditSensor() {
  const location = useLocation();
  const userdata = location.state;

  const [sensorID, setSensorID] = useState(userdata.id || "");  //parsing it from control panel

  const [formData, setFormData] = useState({
    name: "",
    metadata: "",
    category: ""
  });

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const navig = useNavigate();

  const { token } = useAuth();

  useEffect(() => {
    getChosenSensorData(sensorID);
  }, []);

  async function getChosenSensorData(id) {

    try {
      const response = await fetch(
        `http://localhost:8001/getChosenSensorData?id=${id}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setFormData({
          name: data.name || "",
          metadata: data.metadata || "",
          category: data.category || ""
        });
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("Error");
      setSending(false);
    }
  }


  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };


  async function submitChanges() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (!formData.name.trim() || !formData.category.trim() || !formData.metadata.trim()) {
      setMessage("Missing Input");
      setMessageType("Error");
      setSending(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8001/editSensor", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: sensorID,
          name: formData.name,
          category: formData.category,
          metadata: formData.metadata
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
      <ChosenSensorData formData={formData} handleFormChange={handleFormChange} />

      <AvailableCategories currentCategory={formData.category} handleFormChange={handleFormChange} setMessage={setMessage} setMessageType={setMessageType} />

      <button onClick={submitChanges}>
        {sending ? "Sending..." : "EDIT SENSOR"}
      </button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function ChosenSensorData({ formData, handleFormChange }) {

  return (
    <div>
      <input
        type="text"
        placeholder={formData.name}
        value={formData.name}
        onChange={(e) => handleFormChange("name", e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder={formData.metadata}
        value={formData.metadata}
        onChange={(e) => handleFormChange("metadata", e.target.value)}
      />
    </div>
  );
}


function AvailableCategories({ currentCategory, handleFormChange, setMessage, setMessageType }) {

  const [categories, setCategories] = useState([]);

  const { token } = useAuth();

  useEffect(() => {
    fetchSensorCategories();
  }, []);

  async function fetchSensorCategories() {

    try {
      const response = await fetch("http://localhost:8001/getSensorCategories", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("Error");
      setSending(false);
    }
  }

  return (
    <div>
      <label htmlFor="options">categories</label> <br />
      <select
        name="categories"
        id="categories"
        value={currentCategory}
        onChange={(e) => handleFormChange("category", e.target.value)}
      >
        {category.map((category, index) => (
          <option key={index} value={category}>
            {category}
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
