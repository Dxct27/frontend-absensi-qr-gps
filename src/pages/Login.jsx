import InputLabeled from "../components/InputLabeled";
import { Link } from "react-router-dom";
import OvalButton from "../components/OvalButton";
import LogoKominfo from "../assets/logo-kominfo.jpg";
import LogoGoogle from "../assets/logo-google.png";
const Login = () => {
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="w-screen md:w-130 md:border-2 px-5 flex flex-col gap-5 justify-center py-5 items-center">
        <img src={LogoKominfo} style={{ height: 108 }} alt="Kominfo" />
        <h2>Login</h2>
        <InputLabeled
          label="Email"
          placeholder="Email"
          name="email"
          type="email"
          id="email"
          required
        />
        <InputLabeled
          label="Password"
          placeholder="Password"
          name="password"
          type="password"
          id="password"
          required
        />
        <div className="w-full flex justify-between">
          <div className="flex items-center gap-2">
            <input type="checkbox" name="rememberMe" id="rememberMe" />
            <label htmlFor="rememberMe" className="font-semibold">
              Remember me
            </label>
          </div>
          <Link
            to="/"
            className="hover:font-semibold transform duration-300 ease-in-out hover:text-primary600 c underline-offset-2"
          >
            Lupa Password
          </Link>
        </div>
        <OvalButton type="submit" className="bg-white ">
          Login
        </OvalButton>
        <hr className="h=-1 w-full border border-gray-400" />
        <OvalButton>
          <img
            src={LogoGoogle}
            style={{ height: 24, paddingRight: 5 }}
            alt="Google"
          />
          Login with google
        </OvalButton>
      </div>
    </div>
  );
};

export default Login;
