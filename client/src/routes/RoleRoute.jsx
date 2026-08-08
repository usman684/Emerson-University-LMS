import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { dashboardPathForRole } from "../lib/roles";

const RoleRoute = ({ allowedRoles }) => {
  const user = useSelector(selectCurrentUser);

  if (!user) return null;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
