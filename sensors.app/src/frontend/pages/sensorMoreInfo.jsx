import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { useAuth } from "../../context/authContext.jsx";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend 
} from "chart.js";

//register Chart.js components globally for this file
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function SensorMoreInfo() {
  const location = useLocation();
  //safe extraction check in case state is missing
  const id = location.state?.id;

  if (!id) {
    return <div style={{ padding: "20px", color: "red" }}>Σφάλμα: Δεν βρέθηκε ID αισθητήρα.</div>;
  }
  
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <Graph id={id} />
      <hr style={{ margin: "40px 0", borderColor: "#eee" }} />
      <ShowMetadata id={id} />
    </div>
  );
}

//shows a graph of all sensor's measurements
function Graph({ id }) {
  const [sensorData, setSensorData] = useState(null);
  const [resolution, setResolution] = useState("minute");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth();

  useEffect(() => {
    if (id && token) {
      fetchSensorMeasurements();
    }
  }, [id, resolution, token]); 

  async function fetchSensorMeasurements() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8001/getMeasurements?id=${id}&resolution=${resolution}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSensorData(data);
      } else {
        setError(data.message || "Failed to get Data");
        setSensorData(null);
      }
    } catch (err) {
      setError("Failed to connect to server");
      setSensorData(null);
    } finally {
      setLoading(false);
    }
  }

  //function that converts timestamps to utc
  const getFormattedLabels = () => {
    if (!sensorData || !sensorData.timestamps) return [];

    return sensorData.timestamps.map((ts) => {
      const timestampSeconds = Number(ts);
      if (isNaN(timestampSeconds)) return "Unknown time";
      const date = new Date(timestampSeconds * 1000);

      // Έλεγχος αν η ημερομηνία είναι έγκυρη
      if (isNaN(date.getTime())) return "Invalid Date";
      
      if (resolution === "minute") {
        return date.toLocaleString("el-GR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }

      if (resolution === "hour") {
        return date.toLocaleString("el-GR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (resolution === "day") {
        return date.toLocaleDateString("el-GR", {
          day: "numeric",
          month: "short",
          year: "2-digit",
        });
      } else {
        //resolution === "month"
        return date.toLocaleDateString("el-GR", {
          month: "long",
          year: "numeric",
        });
      }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>Time Analysis </label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="minute">Minute</option>
          <option value="hour">Hour</option>
          <option value="day">Day</option>
          <option value="month">Month</option>
        </select>
      </div>

      {loading && <p style={{ color: "#666" }}>Loading Data</p>}
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      {!loading && sensorData && sensorData.values && sensorData.values.length > 0 && (
        <div style={{ maxWidth: "900px", margin: "0 auto", backgroundColor: "#fff", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
          <SensorChart
            values={sensorData.values}
            timestamps={getFormattedLabels()} 
          />
        </div>
      )}

      {!loading && sensorData && (!sensorData.values || sensorData.values.length === 0) && (
        <p style={{ color: "#777", fontStyle: "italic" }}>Couldnt find measurements for this Sensor</p>
      )}
    </div>
  );
}

//cleaned up child chart component
function SensorChart({ values, timestamps }) {
  const chartData = useMemo(() => ({
    labels: timestamps,
    datasets: [{
      label: 'Measurement Value',
      data: values,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.1)',
      tension: 0.1,
    }],
  }), [values, timestamps]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return <Line data={chartData} options={options} />;
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
