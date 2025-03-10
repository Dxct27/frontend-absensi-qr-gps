const BASE_URL = import.meta.env.VITE_BACKEND_URL; // Raw backend URL
const API_BASE_URL = `${BASE_URL}/api`; // Append "/api" for API requests

export const fetchAPI = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "ngrok-skip-browser-warning": "42046",
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/"; // Redirect on unauthorized
      }
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Authentication API calls
export const loginUser = (credentials) => fetchAPI("/auth/login", "POST", credentials);
export const getUser = () => fetchAPI("/user");
export const logoutUser = () => fetchAPI("/auth/logout", "POST");

// Google OAuth redirection
export const googleLogin = () => {
  window.location.href = `${BASE_URL}/auth/google`; // Use raw BASE_URL (no "/api")
};

export const exchangeToken = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/google/callback`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch token");

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};
