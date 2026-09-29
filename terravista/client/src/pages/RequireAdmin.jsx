import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function RequireAdmin({ children }) {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    api
      .me()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted font-body" style={{ color: "#6B7280" }}>
        Verificando sesión...
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
