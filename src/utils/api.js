const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_BASE_URL = `${BASE_URL}/api`;

export const fetchAPI = async (
  endpoint,
  method = "GET",
  body = null,
  isFormData = false,
  skipAuth = false
) => {
  const token = localStorage.getItem("token");

  if (!token && !skipAuth) {
    console.warn("No token found, skipping API call.");
    return Promise.reject("Unauthorized");
  }

  const options = {
    method,
    headers: {
      "Accept": "application/json",
      "ngrok-skip-browser-warning": "42046",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && { "Content-Type": "application/json" }),
    },
    ...(body && { body: isFormData ? body : JSON.stringify(body) }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        console.error("Unauthorized request, refreshing token...");
        await refreshToken();
        return fetchAPI(endpoint, method, body, isFormData, skipAuth);
      }
      throw { status: response.status, data };
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const fetchQRCodes = async (endpoint = "/qrcodes", filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;

    const response = await fetchAPI(url);
    // console.log("Raw response:", response);
    let qrCodes = [...response];

    if (filters.onlyValid) {
      const now = new Date();
      qrCodes = qrCodes.filter((qr) => new Date(qr.waktu_akhir) > now);
    }

    qrCodes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    return qrCodes;
  } catch (err) {
    "Error fetching QR codes:", err;
    throw new Error("Failed to fetch QR codes");
  }
};

export const loginUser = (credentials) =>
  fetchAPI("/auth/login", "POST", credentials, false, true); 
export const getUserData = () => fetchAPI("/user");
export const logoutUser = () => fetchAPI("/auth/logout", "POST");

export const googleLogin = () => {
  window.location.href = `${BASE_URL}/auth/google`;
};

export const yahooLogin = () => {
  window.location.href = `${BASE_URL}/auth/yahoo`;
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
    "API Error:", error;
    return null;
  }
};

export const updateUserOpd = (userId, opdId) => {
  return fetchAPI(`/superadmin/users/${userId}/opd`, "PUT", { opd_id: opdId });
};
