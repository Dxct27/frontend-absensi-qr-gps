import Layout from "../Layout";
import NavBarAdmin from "../NavBar/Admin";

const LayoutAdmin = ({ children }) => (
  <Layout navbar={NavBarAdmin}>{children}</Layout>
);

export default LayoutAdmin;
