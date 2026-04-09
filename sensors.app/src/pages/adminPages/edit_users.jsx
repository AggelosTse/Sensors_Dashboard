import { useState } from "react";

export function EditUsers(){
    const [option, setOption] = useState("");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
  
    const [serverMessage, setMessage] = useState("");
    const [serverMessageType, setMessageType] = useState("");

    const [sending, setSending] = useState(false); //to prevent spamming button

    const data = {username,password,email,fullName};
    const setters = {setUsername,setPassword,setEmail,setFullName};


    function addSubmit(){
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

      const response = fetch("/")
    }

    return(
        <div>
        <SelectionTab
        setOption={setOption}/>

        <AdminOptions option={option} data={data} setters={setters} addSubmit={addSubmit}/>
        <ServerMessage message={serverMessage} messagetype={serverMessageType} />

        </div>
    )


   
}

function SelectionTab({setOption}){
    return(
        <div>
        <label for="options">ADMIN OPTIONS</label > <br/>

        <select 
        name="editusers" 
        id="edidusers" 
        onChange={(e) => setOption(e.target.value)}>

        <option value=""></option>
          <option value="Add User">ADD USER</option>
          <option value="Edit User">EDIT USER</option>
          <option value="Remove User">REMOVE USER</option>
        </select> 
        </div>
        
    );
}
function AdminOptions({option,data,setters, addSubmit}){
    if(option === "Add User"){
      return (
        <div>
            <Adduser {...data} {...setters} addSubmit={addSubmit}/>       
            
        </div>
      );
    }
    else if(option === "Edit User"){
        return <Edituser/>
    }
    else if(option === "Remove User"){
        return <Removeuser/>
    }
    else{
        return null;
    }
    
}
function Adduser({ username,password,email,fullName,setUsername,setPassword,setEmail,setFullName, addSubmit}){
    return(
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
      <button onClick={addSubmit}> ADD USER </button>

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