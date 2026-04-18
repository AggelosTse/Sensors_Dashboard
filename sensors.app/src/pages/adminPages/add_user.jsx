import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AddUser() {

  const navig = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

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
      <AddUserField
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        email={email}
        setEmail={setEmail}
        fullName={fullName}
        setFullName={setFullName}
        role={role}
        setRole={setRole}
        addSubmit={addSubmit}
        sending={sending}
      />

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function AddUserField({
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
  sending,
}) {

  const [roleslist, setRolesList] = useState([]);


  useEffect(() => {
    fetchRoles();

  }, []);



  async function fetchRoles() {
    const response = await fetch("http://localhost:8001/getUserRoles", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok) {
      setRolesList(data)


      if (data.length > 0) {
        setRole(data[0]); 
      }
    }

  }

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
      <label htmlFor="options">ROLE</label> <br />
      <select
        name="userrole"
        id="userrole"
        onChange={(e) => setRole(e.target.value)}
      >
        {roleslist.map((role, index) => (
          <option key={index} value={role}>
            {role}
          </option>
        ))}
      </select>
      <button onClick={addSubmit} disabled={sending}>
        {sending ? "Sending..." : "ADD USER"}
      </button>
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
