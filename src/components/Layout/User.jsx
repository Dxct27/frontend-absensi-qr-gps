import Layout from "../Layout";
import NavBarUser from "../NavBar/User";

const LayoutUser = ({ children }) => (
  <Layout navbar={NavBarUser}>{children}</Layout>
);

export default LayoutUser;
