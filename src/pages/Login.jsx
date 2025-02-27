import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import InputLabeled from "../components/InputLabeled";
import OvalButton from "../components/OvalButton";
import LogoKominfo from "../assets/logo-kominfo.jpg";
import LogoGoogle from "../assets/logo-google.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_BASE_URL_API;

  // Handle standard email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token); // Store token in local storage
        login(data.user, data.token); // Store user session
        navigate(data.user.group === "admin" ? "/adminPanel" : "/dashboard");
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="w-screen md:w-130 md:border-2 px-5 flex flex-col gap-5 justify-center py-5 items-center">
        <img src={LogoKominfo} style={{ height: 108 }} alt="Kominfo" />
        <h2>Login</h2>

        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <InputLabeled
            label="Email"
            placeholder="Email"
            name="email"
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputLabeled
            label="Password"
            placeholder="Password"
            name="password"
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="w-full flex justify-between">
            <div className="flex items-center gap-2">
              <input type="checkbox" name="rememberMe" id="rememberMe" />
              <label htmlFor="rememberMe" className="font-semibold">
                Remember me
              </label>
            </div>
            <a
              href="#"
              className="hover:font-semibold hover:text-primary600 underline-offset-2"
            >
              Lupa Password
            </a>
          </div>

          <OvalButton type="submit" className="bg-white">
            Login
          </OvalButton>
        </form>

        <hr className="h=-1 w-full border border-gray-400" />

        <OvalButton onClick={handleGoogleLogin}>
          <img
            src={LogoGoogle}
            style={{ height: 24, paddingRight: 5 }}
            alt="Google"
          />
          Login with Google
        </OvalButton>
      </div>
    </div>
  );
};

export default Login;
