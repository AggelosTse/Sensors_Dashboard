import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [serverMessage, setMessage] = useState("");
  const [serverMessageType, setMessageType] = useState("");

  const [sending, setSending] = useState(false);  //to prevent spamming button

  const navig = useNavigate();

  async function handleSignUp() {

    if (sending) return;    //if true, button is already doing a task

    setSending(true);

    
    if(!username.trim() || !password.trim() || !email.trim() || !fullName.trim()){

      setTimeout(() => {
       
        setMessage("Missing Input");
        setMessageType("Error");

      }, 700);
      


      setTimeout(() => {
        setSending(false);
      }, 2200);
      return;
    }
    

    const response = await fetch("http://localhost:8001/signUp", {
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
      }),
    });

    const data = await response.json();
    if (response.ok) {

      setMessage(data.message);
      setMessageType(data.messagetype);

      setTimeout(() => {
        //navigating to login page after 4 seconds
        setSending(false);
        navig("/");
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
      <Logo />
      <Fields
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        email={email}
        setEmail={setEmail}
        fullName={fullName}
        setFullName={setFullName}
      />
      <SignUpButton onClick={handleSignUp} issending={sending} />
      <ServerMessage message={serverMessage} messagetype={serverMessageType} />
    </div>
  );
}

function Logo() {
  return <h1>SIGN UP</h1>;
}
function Fields({
  username,
  password,
  setUsername,
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
      />
    </div>
  );
}
function SignUpButton({ onClick, issending }) {
  return (
    <button onClick={onClick} disabled={issending}>
      {issending ? "Processing..." : "Sign Up"}
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
