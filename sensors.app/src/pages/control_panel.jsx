import "../styles/control_panel.css";

import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";

export function ControlPanel() {
  const role = localStorage.getItem("role");

  //fetch data for sensor statistics

  return (
    <div>
      <Boxes />

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

function UsersList() {
  const [userlist, setUserlist] = useState([]);
  const navig = useNavigate();

  useEffect(() => {
    //load data when page loads
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
      const combined = data.usernames.map((uname, index) => ({
        id: data.id[index],
        username: uname,
        email: data.emails[index],
        role: data.roles[index],
        password: data.passwords[index],
        fullname: data.fullnames[index]
      }));
      setUserlist(combined);
    }
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
                  <button
                    className="edit"
                    onClick={() =>
                      navig("/edit_user", {
                        state: {
                          id: user.id,
                          username:user.username,
                          email:user.email,
                          password: user.password,
                          fullname: user.fullname,
                          role:user.role
                        },
                      })
                    }
                  >
                    Edit
                  </button>
                  <button className="delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
