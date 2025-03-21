import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserData } from "../utils/api";
import { ClipLoader } from "react-spinners";

const AuthCallback = () => {
  const { handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);

      getUserData()
        .then((userData) => {
          console.log("User Data Retrieved:", userData);

          // if (!userData.has_password) {
          //   localStorage.setItem("showSetPasswordModal", "true");
          // } else {
          //   localStorage.removeItem("showSetPasswordModal");
          // }

          if (userData.user.group) {
            handleLogin({ user: userData.user, token });

            switch (userData.user.group) {
              case "superadmin":
                navigate("/superadmin");
                break;
              case "admin":
                navigate("/adminpanel");
                break;
              default:
                navigate("/dashboard");
            }
          } else {
            console.error("Invalid user userData format:", userData.user);
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

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ClipLoader color="#007bff" size={50} />
      <p className="mt-4 text-gray-600">Memproses Login ...</p>
    </div>
  );
};

export default AuthCallback;
