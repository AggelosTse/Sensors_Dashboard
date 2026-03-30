import { useState } from "react";
import { Link } from "react-router-dom";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    fetch("http://localhost:8001/loginValidation", {
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

      <TextForSignup />
      <LoginButton onClick={handleLogin} />
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

function TextForSignup() {
  return (
    <div>
      <p>
        Dont Have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}

function LoginButton({ onClick }) {
  return <button onClick={onClick}>Login</button>;
}
