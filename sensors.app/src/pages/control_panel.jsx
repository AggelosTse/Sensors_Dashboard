import "../styles/control_panel.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export function ControlPanel() {
  const role = localStorage.getItem("role");

  //fetch data for sensor statistics

  return (
    <div>
      <Boxes />

      {role === "admin" && <AddSensorButton />}
      <SensorsTable />

      {role === "admin" && <UsersList />}
    </div>
  );
}

function Boxes() {
  return (
    <div className="boxes-container">
      <div className="boxes">Box 1 </div>
      <div className="boxes">Box 1 </div>

      <div className="boxes">Box 1 </div>
    </div>
  );
}


function AddSensorButton() {
  const navig = useNavigate();

  return (
    <button onClick={() => navig("/addSensor")}>Add Sensor</button>
  )
}




function SensorsTable() {
    const navig = useNavigate();    

  const [sensorList, setSensorlist] = useState([]);

  const [errorOccured, setErrorOccured] = useState(false);
  const [serverMessage, setMessage] = useState("");

  useEffect(() => {
    //load data when page loads
    setErrorOccured(false);
    getSensorData();

  }, []);


  //sensors table with all sensors on the control panel
  async function getSensorData() {
    const response = await fetch("http://localhost:8001/getSensorsData", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      setErrorOccured(false);
      const combined = data.names.map((sensorName, index) => ({
        id: data.id[index],
        name: sensorName,
        category: data.categories[index]
      }));
      setSensorlist(combined);
    }
    else {
      setErrorOccured(true);
      setMessage(data.message);
    }
  }

  if (errorOccured) {
    return (
      <div>

        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>

              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="2" style={{ textAlign: "center", color: "red", padding: "20px" }}>
                  {serverMessage}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  else {
    return (
      <div>
        <div>
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>Name</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {sensorList.map((sensor, index) => (
                <tr key={index}>
                  <td>{sensor.id}</td>
                  <td>{sensor.name}</td>
                  <td>{sensor.category}</td>
                  <td>
                    <button
                      onClick={() =>
                        navig("/edit_sensor", {
                          state: {
                            id: sensor.id
                          },
                        })
                      }
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button onClick={() =>
                        navig("/sensorMoreInfo", {
                          state: {
                            id: sensor.id
                          },
                        })
                      }>
                        More Info
                    </button>
                  
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}






function UsersList() {
  const [userlist, setUserlist] = useState([]);
  const [errorOccured, setErrorOccured] = useState(false);
  const [serverMessage, setMessage] = useState("");

  const navig = useNavigate();

  useEffect(() => {
    //load data when page loads
    setErrorOccured(false);
    getUsersData();

  }, []);

  async function getUsersData() {
    const response = await fetch("http://localhost:8001/getUserData", {
      method: "GET",
      headers: {
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
  else {
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
                    <button
                      onClick={() =>
                        navig("/edit_user", {
                          state: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            password: user.password,
                            fullname: user.fullname,
                            role: user.role,
                          },
                        })
                      }
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        confirmationWndow(user.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}

