import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LoginPage() {
  const navig = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false); //to prevent spamming button

  async function handleLogin() {
    if (sending) return; //if true, button is already doing a task

    setSending(true);

    if (!username.trim() || !password.trim()) {
      setTimeout(() => {
        setMessage("Missing Input");
        setMessageType("Error");
      }, 700);

      setTimeout(() => {
        setSending(false);
      }, 2200);

      return;
    }

    const response = await fetch("http://localhost:8001/loginValidation", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(data.message);
      setMessageType(data.messagetype);

      localStorage.setItem("role", data.role);

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
      <Logo />
      <Fields
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
      />

      <TextForSignup issending={sending} />
      <LoginButton onClick={handleLogin} issending={sending} />
      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function Logo() {
  return <h1>LOG IN</h1>;
}
function Fields({ username, password, setUsername, setPassword }) {
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
    </div>
  );
}

function TextForSignup({ issending }) {
  return (
    <div>
      <p>
        Dont Have an account?
        {issending ? (
          <span style={{ color: "gray", cursor: "not-allowed" }}>Sign up</span>
        ) : (
          <Link to="/signup">Sign up</Link>
        )}
      </p>
    </div>
  );
}

function LoginButton({ onClick, issending }) {
  return (
    <button onClick={onClick} disabled={issending}>
      {issending ? "Processing..." : "Log In"}
    </button>
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
