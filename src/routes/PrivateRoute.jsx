import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ element, role }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/" />;

    return user.group === role ? element : <Navigate to="/" />;
};

export default PrivateRoute;
