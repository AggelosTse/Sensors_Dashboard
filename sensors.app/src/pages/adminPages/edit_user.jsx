import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function EditUser() {

  const location = useLocation();
  const userdata = location.state;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  const navig = useNavigate();

  //filling the fields when the page loads
  useEffect(() => {
    if (userdata) {
      setUsername(userdata.username || "");
      setPassword(userdata.password || "");
      setEmail(userdata.email || "");
      setFullName(userdata.fullname || "");
      setRole(userdata.role) || "";
    }
  }, [userdata]);

  async function submitButton() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (
      !username.trim() ||
      !password.trim() ||
      !email.trim() ||
      !fullName.trim()
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

    const response = await fetch("http://localhost:8001/edituser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userdata.id,
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
        setSending(false);
        navig("/control_panel");
      }, 2200);
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
      <ChosenUserData
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        email={email}
        setEmail={setEmail}
        fullName={fullName}
        setFullName={setFullName}
      />

      <ChosenUserRole role={role} setRole={setRole} />

      <button onClick={submitButton}>Update</button>

      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}
function ChosenUserData({
  username,
  setUsername,
  password,
  setPassword,
  email,
  setEmail,
  fullName,
  setFullName,
}) {
  return (
    <div>
      <input
        type="text"
        placeholder={username}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />{" "}
      <br />
      <input
        type="password"
        placeholder={password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder={email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder={fullName}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
    </div>
  );
}

function ChosenUserRole({ role, setRole }) {
  return (
    <div>
      <label for="options">user role</label> <br />
      <select
        name="editusers"
        id="edidusers"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="admin">admin</option>
        <option value="user">user</option>
      </select>
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
