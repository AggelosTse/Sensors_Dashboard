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

      <SensorsTable/>


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



function SensorsTable(){

  const [sensorList, setSensorlist] = useState([]);

  const [errorOcured, setErrorOccured] = useState(false);
  const [serverMessage, setMessage] = useState("");

    useEffect(() => {
    //load data when page loads
    setErrorOccured(false);
    getSensorData();

  }, []);


  async function getSensorData(){
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

  if (errorOcured) {
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
        <button>add sensor</button>

        <div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {sensorList.map((sensor, index) => (
                <tr key={index}>
                  <td>{sensor.name}</td>
                  <td>{sensor.category}</td>
                  <td>
                    <button
                    >
                      Edit
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
  const [errorOcured, setErrorOccured] = useState(false);
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


  if (errorOcured) {
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

