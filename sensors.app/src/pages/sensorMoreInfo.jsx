import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function SensorMoreInfo() {
  const location = useLocation();
  const id = location.state;

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

  useEffect(() => {
    fetchSensorMeasurements(id);
  }, [id]);

  async function fetchSensorMeasurements(id) {
    const response = await fetch(
      `http://localhost:8001/getMeasurements?id=${id}`,
      {
        method: "GET",
        headers: {
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
  if (!sensorData) {
    return null;
  }

  return (
    <SensorChart
      values={sensorData.values}
      timestamps={sensorData.timestamps}
    />
  );
}

function SensorChart({ values, timestamps }) {
  const data = {
    labels: timestamps,
    datasets: [{
      label: 'Τιμή Μέτρησης',
      data: values,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };

  return <Line data={data} />;
}

//shows all sensor data
function ShowMetadata({ id }) {
  const [sensorName,setSensorName] = useState("");
  const [sensorCategory, setSensorCategory] = useState("");
  const [sensorMetadata,setSensorMetadata] = useState("");


  useEffect(() => {
    fetchFullMetadata(id);
  }, [id]);

  async function fetchFullMetadata(id) {
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

  return(
    <div>
      <p>{sensorName}</p>
      <p>{sensorCategory}</p>
      <p>{sensorMetadata}</p>
    </div>
  )
}
