import { useState } from "react";

export function EditUsers() {
  const [option, setOption] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const data = { username, password, email, fullName, role };
  const setters = { setUsername, setPassword, setEmail, setFullName, setRole };

  async function addSubmit() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (
      !username.trim() ||
      !password.trim() ||
      !email.trim() ||
      !fullName.trim() ||
      !role.trim()
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

    const response = await fetch("http://localhost:8001/adduser", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email,
        fullName: fullName,
        role: role,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
      setMessageType(data.messagetype);

      setTimeout(() => {
        //navigating to dashboard page after 4 seconds
        setSending(false);
        navig("/control_panel");
      }, 4000);
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
      <SelectionTab setOption={setOption} />

      <AdminOptions
        option={option}
        data={data}
        setters={setters}
        addSubmit={addSubmit}
      />
      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function SelectionTab({ setOption }) {
  return (
    <div>
      <label for="options">ADMIN OPTIONS</label> <br />
      <select
        name="editusers"
        id="edidusers"
        onChange={(e) => setOption(e.target.value)}
      >
        <option value=""></option>
        <option value="Add User">ADD USER</option>
        <option value="Edit User">EDIT USER</option>
        <option value="Remove User">REMOVE USER</option>
      </select>
    </div>
  );
}
function AdminOptions({ option, data, setters, addSubmit }) {
  if (option === "Add User") {
    return (
      <div>
        <AddUser {...data} {...setters} addSubmit={addSubmit} />
      </div>
    );
  } else if (option === "Edit User") {
    return <UpdateUser />;
  } else if (option === "Remove User") {
    return <Removeuser />;
  } else {
    return null;
  }
}
function AddUser({
  username,
  password,
  email,
  fullName,
  setUsername,
  setPassword,
  setEmail,
  setFullName,
  setRole,
  addSubmit,
}) {
  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />{" "}
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="fullName"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />{" "}
      <br />
      <label for="options">ROLE</label> <br />
      <select
        name="userrole"
        id="userrole"
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="user">USER</option>
        <option value="admin">ADMIN</option>
      </select>
      <button onClick={addSubmit}> ADD USER </button>
    </div>
  );
}


function UpdateUser(){

  async function getUsersData(){
    const response = await fetch("http://localhost:8001/getUserData", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      
  });
  const data = await response.json();
  if(!response.ok){
    
  }

}
 


  return(
    <div>
      <table>
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Role</th>
      </tr>
      </table>
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