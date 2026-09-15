import React from "react";
import RequireRole from "../auth/RequireRole";

const AdminRoute = ({ children }) => {
  return <RequireRole allowedRoles={["Admin"]}>{children}</RequireRole>;
};

export default AdminRoute;
