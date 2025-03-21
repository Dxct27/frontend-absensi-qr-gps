import Layout from "../Layout";
import NavBarSuperadmin from "../NavBar/Superadmin";

const LayoutSuperadmin = ({ children }) => (
  <Layout navbar={NavBarSuperadmin}>{children}</Layout>
);

export default LayoutSuperadmin;
