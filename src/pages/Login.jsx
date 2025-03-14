import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, googleLogin, yahooLogin } from "../utils/api";
import InputLabeled from "../components/InputLabeled";
import OvalButton from "../components/OvalButton";
import LogoKominfo from "../assets/logo-kominfo.jpg";
import LogoGoogle from "../assets/logo-google.png";
import LogoYahoo from "../assets/logo-yahoo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  // Handle standard email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      handleLogin({ user: data.user.user, token: data.token });
      navigate(data.user.group === "admin" ? "/adminPanel" : "/dashboard");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const handleYahooLogin = () => {
    yahooLogin();
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
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputLabeled
            label="Password"
            placeholder="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="w-full flex justify-between">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="rememberMe" />
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

          <OvalButton type="submit" className="bg-white" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </OvalButton>
        </form>

        <hr className="w-full border border-gray-400" />

        <OvalButton onClick={handleGoogleLogin}>
          <img
            src={LogoGoogle}
            style={{ height: 24, paddingRight: 5 }}
            alt="Google"
          />
          Login with Google
        </OvalButton>

        <OvalButton onClick={handleYahooLogin}>
          <img
            src={LogoYahoo}
            style={{ height: 24, paddingRight: 5 }}
            alt="Yahoo"
          />
          Login with Yahoo
        </OvalButton>
      </div>
    </div>
  );
};

export default Login;
