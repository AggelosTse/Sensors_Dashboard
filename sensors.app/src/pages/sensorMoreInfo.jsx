import { useEffect, useState } from "react";

export function SensorMoreInfo() {
  const location = useLocation();
  const userdata = location.state;

  const [sensorID, setSensorID] = useState("");

  useEffect(() => {
    if (userdata) {
      setSensorID(userdata.id || "");
    }
  });

  return (
    <div>
      <Graph id={id} />
      <ShowMetadata id={id} />
    </div>
  );
}

//shows a graph of all sensor's measurements
function Graph({ id }) {
  async function fetchSensorMeasurements() {
    const response = await fetch(`http://localhost:8001/getMeasurements?id=${id}`,{
        method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
    })
    const data = await response.json()

    if(response.ok){
        return(
            <p/>
        )
    }
    else{
        return null;
    }
  }
}

//shows all sensor data
function ShowMetadata({ id }) {

    async function fetchFullMetadata(){

    }

  
}
