const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const apiFetch = async (endpoint, method = "GET", body = null) => {
    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}), // Add token if available
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Request failed");
        return data;
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};
