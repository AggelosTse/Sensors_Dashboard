import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

//token manager
export function AuthProvider({ children }) {

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));

  //store user info in localstorage 
  const login = (newToken, newRole, username) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("username", username);
    setToken(newToken);
    setRole(newRole);
    setUsername(username);
  };

  //remove user info when logs out
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, role,username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

//useAuth returns user info
export function useAuth() {
  return useContext(AuthContext);
}