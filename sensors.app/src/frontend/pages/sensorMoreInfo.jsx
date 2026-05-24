import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { useAuth } from "../../context/authContext.jsx";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function SensorMoreInfo() {
  const location = useLocation();
  const id = location.state.id;

  return (
    <div>
      <Graph id={id} />
      <ShowMetadata id={id} />
    </div>
  );
}

//shows a graph of all sensor's measurements
function Graph({ id }) {
  const [sensorData, setSensorData] = useState(null);
  const [resolution, setResolution] = useState("hour");

  const { token } = useAuth();

  useEffect(() => {
    fetchSensorMeasurements();
  }, [id,resolution]);

  async function fetchSensorMeasurements() {
    const response = await fetch(
      `http://localhost:8001/getMeasurements?id=${id}&resolution=${resolution}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (response.ok) {
      setSensorData(data);
    }
  }
  return (
    <div>

    <div style={{ marginBottom: "20px" }}>
      <label>Χρονική Ανάλυση: </label>

      <select
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
      >
        <option value="hour">Ανά Ώρα</option>
        <option value="day">Ανά Ημέρα</option>
        <option value="month">Ανά Μήνα</option>
      </select>
    </div>

    {sensorData && (
      <SensorChart
        values={sensorData.values}
        timestamps={sensorData.timestamps}
      />
    )}
  </div>
  );
}

function SensorChart({ values, timestamps }) {

  const chartData = useMemo(() => ({
    labels: timestamps.map(t =>
      new Date(t).toLocaleString("el-GR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      })
    ),
    datasets: [{
      label: 'Τιμή Μέτρησης',
      data: values,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  }), [values, timestamps]);

  return <Line data={chartData} />;
}

//shows all sensor data
function ShowMetadata({ id }) {

  const [formData, setFormData] = useState({
    name: "",
    metadata: "",
    category: ""
  });

  const { token } = useAuth();

  useEffect(() => {
    fetchFullMetadata(id);
  }, [id]);

  async function fetchFullMetadata(id) {
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
        name: data.name,
        metadata: data.metadata,
        category: data.category
      })
    }
  }

  return (
    <div>
      <p>{formData.name}</p>
      <p>{formData.metadata}</p>
      <p>{formData.category}</p>
    </div>
  )
}
