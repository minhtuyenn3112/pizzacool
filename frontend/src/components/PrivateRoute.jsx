import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// roles: optional, nếu truyền ["admin"] chỉ cho admin
const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    // Nếu chưa login => chuyển về login
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.vaiTro)) {
    // Nếu role không hợp lệ => redirect về trang user
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
