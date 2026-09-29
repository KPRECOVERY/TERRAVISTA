import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import RoofMark from "../components/RoofMark.jsx";
import { api } from "../services/api.js";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#FAFAF8" }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
      >
        <div className="flex items-center gap-2 font-display font-bold text-lg justify-center mb-1">
          <RoofMark className="w-7 h-4" style={{ color: "#0F766E" }} />
          Terravista
        </div>
        <p className="text-center text-sm mb-6" style={{ color: "#6B7280" }}>
          Acceso al panel de administración
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Usuario</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-xl border outline-none"
              style={{ borderColor: "#E5E7EB", backgroundColor: "#FAFAF8" }}
              autoComplete="username"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-sm px-3.5 py-2.5 rounded-xl border outline-none"
              style={{ borderColor: "#E5E7EB", backgroundColor: "#FAFAF8" }}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 text-sm font-semibold text-white py-2.5 rounded-full mt-2 disabled:opacity-60"
            style={{ backgroundColor: "#0F766E" }}
          >
            <Lock className="w-4 h-4" /> {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </div>
      </form>
    </div>
  );
}
