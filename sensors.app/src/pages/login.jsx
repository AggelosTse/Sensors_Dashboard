import { useState } from "react";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    
  }

  return (
    <div>
      <FieldText
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
      />
      <LoginButton onClick={handleLogin} />
    </div>
  );
}

function FieldText({ username, password, setUsername, setPassword }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /> <br/>
      <input
        type="text"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
}

function LoginButton({ onClick }) {
  return <button onClick={onClick}>Login</button>;
}
