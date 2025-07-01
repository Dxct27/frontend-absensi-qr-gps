import { createContext, useContext, useState, useEffect } from "react";
import { getUserData, logoutUser, googleLogin, fetchAPI } from "../utils/api";

export const AuthContext = createContext();

let refreshTimer; // Store the timer ID globally

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
        const Data = await getUserData();
        setUser(Data.user);
        localStorage.setItem("user", JSON.stringify(Data.user));
        scheduleTokenRefresh();
      } catch (error) {
        console.error("Failed to fetch user:", error);
        logout();
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const handleLogin = async ({ user, token }) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    scheduleTokenRefresh();
  };

  const refreshToken = async () => {
    try {
      const response = await fetchAPI("/auth/refresh", "POST");
      const newToken = response.token;

      setToken(newToken);
      localStorage.setItem("token", newToken);
      scheduleTokenRefresh();
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  };

  const scheduleTokenRefresh = () => {
    // Clear any existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Schedule a new token refresh
    const tokenExpiration = Date.now() + 55 * 60 * 1000; // Refresh 5 minutes before expiration
    refreshTimer = setTimeout(refreshToken, tokenExpiration - Date.now());
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
