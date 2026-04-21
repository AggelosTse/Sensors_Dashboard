import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function EditSensor() {
  const location = useLocation();
  const userdata = location.state;

  const [sensorID, setSensorID] = useState("");
  const [sensorName, setSensorName] = useState("");
  const [sensorCategory, setSensorCategory] = useState("");
  const [sensorMetadata, setSensorMetadata] = useState("");

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const navig = useNavigate();

  useEffect(() => {
    if (userdata) {
      setSensorID(userdata.id || "");
    }
    getChosenSensorData(userdata.id);
  }, [userdata]);

  async function getChosenSensorData(id) {
    const response = await fetch(
      `http://localhost:8001/getChosenSensorData?id=${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (response.ok) {
      setSensorName(data.name);
      setSensorCategory(data.category);
      setSensorMetadata(data.metadata);
    }
  }

  async function submitChanges() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (
      !sensorName.trim() ||
      !sensorCategory.trim() ||
      !sensorMetadata.trim()
    ) {
      setTimeout(() => {
        setMessage("Missing Input");
        setMessageType("Error");
      }, 700);

      setTimeout(() => {
        setSending(false);
      }, 2200);
      return;
    }

    const response = await fetch("http://localhost:8001/editSensor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: sensorID,
        name: sensorName,
        category: sensorCategory,
        metadata: sensorMetadata,
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
      setTimeout(() => {
        setMessage(data.message);
        setMessageType(data.messagetype);
      }, 700);

      setTimeout(() => {
        setSending(false);
      }, 2200);
    }
  }

  return (
    <div>
      <Logo />
      <ChosenSensorData
        sensorID={sensorID}
        setSensorID={setSensorID}
        sensorName={sensorName}
        setSensorName={setSensorName}
        sensorCategory={sensorCategory}
        setSensorCategory={setSensorCategory}
        sensorMetadata={sensorMetadata}
        setSensorMetadata={setSensorMetadata}
      />
      <AvailableCategories
        category={sensorCategory}
        setCategory={setSensorCategory}
      />
      <button onClick={submitChanges}>Update sensor</button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function Logo() {
  return <h1> EDIT SENSOR</h1>;
}

function ChosenSensorData({
  sensorName,
  setSensorName,
  sensorMetadata,
  setSensorMetadata,
}) {
  return (
    <div>
      <input
        type="text"
        placeholder={sensorName}
        value={sensorName}
        onChange={(e) => setSensorName(e.target.value)}
      />{" "}
      <br />
      <input
        type="text"
        placeholder={sensorMetadata}
        value={sensorMetadata}
        onChange={(e) => setSensorMetadata(e.target.value)}
      />
    </div>
  );
}
function AvailableCategories({ category, setCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchSensorCategories();
  }, []);

  async function fetchSensorCategories() {
    const response = await fetch("http://localhost:8001/getSensorCategories", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      setCategories(data);
    }
  }

  return (
    <div>
      <label htmlFor="options">categories</label> <br />
      <select
        name="categories"
        id="categories"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categories.map((categories, index) => (
          <option key={index} value={categories}>
            {categories}
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
