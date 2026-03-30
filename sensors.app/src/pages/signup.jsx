import { useState } from "react";

export function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  function handleSignUp() {
    fetch("http://localhost:8001/signUp", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        email: email,
        fullName: fullName
      }),
    });
  }

  return (
    <div>
      <Logo />
      <Fields
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        email = {email}
        setEmail = {setEmail}
        fullName = {fullName}
        setFullName = {setFullName}
      />
      <SignUpButton onClick={handleSignUp} />
    </div>
  );
}

function Logo() {
  return <h1>SIGN UP</h1>;
}
function Fields({ username, password, setUsername, setPassword, email,setEmail,fullName,setFullName }) {
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
function SignUpButton({ onClick }) {
  return <button onClick={onClick}>Sign Up</button>;
}
