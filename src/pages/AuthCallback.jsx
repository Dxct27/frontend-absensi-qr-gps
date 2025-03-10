import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

axios.defaults.headers.common["ngrok-skip-browser-warning"] = "420690";

const AuthCallback = () => {
  const { handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);

      axios
        .get(`${import.meta.env.VITE_BASE_URL_API}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => {
          console.log("User Data Retrieved:", data);

          if (data.group) {
            handleLogin({ user: data, token });
            navigate(data.group === "admin" ? "/adminPanel" : "/dashboard");
          } else {
            console.error("Invalid user data format:", data);
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("Error fetching user:", error);
          navigate("/");
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;