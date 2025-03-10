import { createContext, useContext, useState, useEffect } from "react";
import { getUser, loginUser, logoutUser, googleLogin } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const userData = await getUser();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData)); // ✅ Store user data
        // console.log("User data:", userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        logout(); // ✅ Logout if token is invalid
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const handleLogin = async ({ user, token }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // ✅ Persist user data
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, handleLogin, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
