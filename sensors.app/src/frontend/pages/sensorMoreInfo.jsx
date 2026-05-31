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
        setError(data.message || "Αποτυχία ανάκτησης δεδομένων");
        setSensorData(null);
      }
    } catch (err) {
      setError("Σφάλμα δικτύου: Αδυναμία σύνδεσης με τον server");
      setSensorData(null);
    } finally {
      setLoading(false);
    }
  }

  // Helper συνάρτηση που μετατρέπει τα timestamps (seconds) σε τοπική ώρα/ημερομηνία
  const getFormattedLabels = () => {
    if (!sensorData || !sensorData.timestamps) return [];

    return sensorData.timestamps.map((ts) => {
      // Μετατροπή των δευτερολέπτων (Python) σε milliseconds (JS)
      const timestampSeconds = Number(ts);
      if (isNaN(timestampSeconds)) return "Άγνωστη Ώρα";
      const date = new Date(timestampSeconds * 1000);

      // Έλεγχος αν η ημερομηνία είναι έγκυρη
      if (isNaN(date.getTime())) return "Invalid Date";
      
      if (resolution === "minute") {
        return date.toLocaleString("el-GR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }

      // Διαφορετικό format ανάλογα με το επιλεγμένο resolution
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
        // resolution === "month"
        return date.toLocaleDateString("el-GR", {
          month: "long",
          year: "numeric",
        });
      }
    });
  };

  return (
    <div>
      {/* Φίλτρο Χρονικής Ανάλυσης */}
      <div style={{ marginBottom: "20px" }}>
        <label>Χρονική Ανάλυση: </label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        >
          <option value="minute">Ανά Λεπτό</option>
          <option value="hour">Ανά Ώρα</option>
          <option value="day">Ανά Ημέρα</option>
          <option value="month">Ανά Μήνα</option>
        </select>
      </div>

      {/* State Messages */}
      {loading && <p>Φόρτωση δεδομένων...</p>}
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      {/* Εμφάνιση του Γράφου με τα νέα μορφοποιημένα timestamps */}
      {!loading && sensorData && sensorData.values.length > 0 && (
        <SensorChart
          values={sensorData.values}
          timestamps={getFormattedLabels()} // Εδώ περνάει το array με τα έτοιμα strings
        />
      )}

      {/* Έλεγχος για άδεια δεδομένα */}
      {!loading && sensorData && sensorData.values.length === 0 && (
        <p>Δεν βρέθηκαν μετρήσεις για τον συγκεκριμένο αισθητήρα.</p>
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
