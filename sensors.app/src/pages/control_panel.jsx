import "../styles/control_panel.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "./authContext";

import Swal from "sweetalert2";

import { Pie, Bar } from "react-chartjs-2";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


export function ControlPanel() {

  const [sensorInfoStats, setSensorInfoStats] = useState([])

  const [sensorList, setSensorlist] = useState([]);

  const [errorOccured, setErrorOccured] = useState(false);
  const [serverMessage, setMessage] = useState("");

  const { role, token } = useAuth();

  useEffect(() => {
    //load data when page loads
    setErrorOccured(false);
    getSensorData();

  }, []);


  async function getSensorData() {
    const response = await fetch("http://localhost:8001/getSensorsData", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      setErrorOccured(false);


      let infoStats = []
      infoStats.push(data.sensorInfoStats.sumOfSensors)
      infoStats.push(data.sensorInfoStats.sumOfMeasurements)
      infoStats.push(data.sensorInfoStats.avgTemp)
      infoStats.push(data.sensorInfoStats.avgHumid)

      setSensorInfoStats(infoStats)


      const combined = data.sensorTable.names.map((sensorName, index) => ({
        id: data.sensorTable.id[index],
        name: sensorName,
        category: data.sensorTable.categories[index]
      }));
      setSensorlist(combined);

    }
    else {
      setErrorOccured(true);
      setMessage(data.message);
    }
  }

  return (
    <div>
      <Boxes sensorInfoStats={sensorInfoStats} />

      <SensorGraphs sensorList={sensorList} sensorInfoStats={sensorInfoStats} />

      <SensorsTable sensorList={sensorList} errorOccured={errorOccured} serverMessage={serverMessage} />

      {role === "admin" && <UsersTable />}
    </div>
  );
}

function Boxes({ sensorInfoStats }) {
  return (
    <div className="boxes-container">
      <div className="boxes">TOTAL SENSORS: {sensorInfoStats[0]} </div>
      <div className="boxes">TOTAL MEASUREMENTS: {sensorInfoStats[1]} </div>
      <div className="boxes">AVERAGE TEMPERATURE: {sensorInfoStats[2]} </div>
      <div className="boxes">AVERAGE HUMIDITY: {sensorInfoStats[3]} </div>

    </div>
  );
}

function SensorGraphs({ sensorList, sensorInfoStats }) {

  //counts is a dict
  const counts = sensorList.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;  //format "humidity" : 4 
    return acc;
  }, {});


  const pieData = {
    labels: Object.keys(counts),
    datasets: [
      {
        label: "Πλήθος Αισθητήρων",
        data: Object.values(counts),
        backgroundColor: ["#4bc0c0", "#36a2eb", "#ffcd56", "#ff6384"],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ["Θερμοκρασία (°C)", "Υγρασία (%)"],
    datasets: [
      {
        label: "Μέση Τιμή",
        data: [sensorInfoStats[2], sensorInfoStats[3]],
        backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"],
        borderColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", marginTop: "40px" }}>
      <div style={{ width: "350px" }}>
        <h3>Κατανομή Αισθητήρων</h3>
        <Pie data={pieData} />
      </div>
      <div style={{ width: "450px" }}>
        <h3>Μέσοι Όροι Μετρήσεων</h3>
        <Bar data={barData} options={{ responsive: true }} />
      </div>
    </div>
  );

}

//sensors table with all sensors on the control panel
function SensorsTable({ sensorList, errorOccured, serverMessage }) {

  const navig = useNavigate();
  const { role } = useAuth();

  return (
    <div>
      {role === "admin" && (<button onClick={() => navig("/addSensor")}>Add Sensor</button>)}
      <div>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>Name</th>
              <th>Category</th>
              <th>Actions</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {errorOccured ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "red", padding: "20px" }}>
                  {serverMessage}
                </td>
              </tr>
            ) : (
              sensorList.map((sensor, index) => (
                <tr key={sensor.id || index}>
                  <td>{sensor.id}</td>
                  <td>{sensor.name}</td>
                  <td>{sensor.category}</td>
                  <td>
                    {role === "admin" && (
                      <button onClick={() => navig("/edit_sensor", { state: { id: sensor.id } })}>
                        Edit
                      </button>
                    )}
                  </td>
                  <td>
                    <button onClick={() => navig("/sensorMoreInfo", { state: { id: sensor.id } })}>
                      More Info
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function UsersTable() {
  const [userlist, setUserlist] = useState([]);
  const [errorOccured, setErrorOccured] = useState(false);
  const [serverMessage, setMessage] = useState("");

  const navig = useNavigate();

  const { token } = useAuth();


  useEffect(() => {
    //load data when page loads
    setErrorOccured(false);
    getUsersData();

  }, []);

  async function getUsersData() {
    const response = await fetch("http://localhost:8001/getUserData", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      setErrorOccured(false);
      const combined = data.usernames.map((uname, index) => ({
        id: data.id[index],
        username: uname,
        email: data.emails[index],
        role: data.roles[index],
        password: data.passwords[index],
        fullname: data.fullnames[index],
      }));
      setUserlist(combined);
    }
    else {
      setErrorOccured(true);
      setMessage(data.message);
    }
  }

  const confirmationWndow = async (userid) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch("http://localhost:8001/deleteuser", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: userid,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          await Swal.fire({
            title: "Deleted!",
            text: data.message,
            icon: "success",
          });

          getUsersData();
        } else {


          Swal.fire({
            title: "Error!",
            text: data.message,
            icon: "error",
          });
        }
      }
    });
  };

  if (errorOccured) {
    return (
      <div>

        <div>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "red", padding: "20px" }}>
                  {serverMessage}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navig("/add_user")}>add user</button>

      <div>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userlist.map((user, index) => (
              <tr key={index}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => navig("/edit_user", { state: { id: user.id, }, })}>Edit</button>
                  <button onClick={() => { confirmationWndow(user.id); }}> Delete </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


