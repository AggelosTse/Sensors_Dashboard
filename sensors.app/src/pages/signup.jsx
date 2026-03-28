import { useState } from "react";

export function SignUpPage(){
      const [username, setUsername] = useState("");
      const [password, setPassword] = useState("");
    
      function handleSignUp(){

      }

return(    <div>
        <Logo />
        <Fields
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
      />
      <SignUpButton onClick={handleSignUp} />
    </div>
)
}

function Logo(){
    return(
        <h1>SIGN UP</h1>
    )
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
          type="text"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
    );
  }
  function SignUpButton({ onClick }) {
    return <button onClick={onClick}>Sign Up</button>;
  }