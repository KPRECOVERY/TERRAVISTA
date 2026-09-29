import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, BedDouble, Bath, Ruler } from "lucide-react";
import RoofMark from "../components/RoofMark.jsx";
import { api } from "../services/api.js";

export default function Landing() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .listProperties()
      .then((res) => setProperties(res.data))
      .catch(() => setError("No se pudo cargar el catálogo"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#FAFAF8", color: "#1F2937" }}>
      <header className="sticky top-0 z-20 border-b backdrop-blur-md" style={{ borderColor: "#E5E7EB", backgroundColor: "rgba(250,250,248,0.85)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <RoofMark className="w-7 h-4" style={{ color: "#0F766E" }} />
            Terravista
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
        <p className="font-body text-sm tracking-wide uppercase mb-4" style={{ color: "#0F766E" }}>
          Bienes raíces en Honduras
        </p>
        <h1 className="font-display font-extrabold text-4xl md:text-5xl leading-tight max-w-2xl mx-auto">
          Encuentra el lugar donde empieza tu próxima historia
        </h1>

        <div
          className="mt-10 max-w-2xl mx-auto flex items-center gap-2 p-2 rounded-full border shadow-sm"
          style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
        >
          <div className="flex items-center gap-2 flex-1 px-3">
            <Search className="w-4 h-4" style={{ color: "#6B7280" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ciudad o título de la propiedad"
              className="w-full py-2 outline-none font-body text-sm bg-transparent"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading && <p className="text-sm text-center" style={{ color: "#6B7280" }}>Cargando propiedades...</p>}
        {error && <p className="text-sm text-center text-red-600">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-center" style={{ color: "#6B7280" }}>
            No hay propiedades que coincidan con tu búsqueda.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Link
              to={`/propiedad/${p.id}`}
              key={p.id}
              className="group rounded-2xl overflow-hidden border transition-shadow hover:shadow-lg block"
              style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}
            >
              <div className="relative h-52 overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
                {p.images?.[0] && (
                  <img
                    src={p.images[0].url}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <span
                  className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-white capitalize"
                  style={{ backgroundColor: "#0F766E" }}
                >
                  {p.status}
                </span>
              </div>

              <div className="p-5">
                <p className="font-display font-bold text-lg">
                  {p.currency === "USD" ? "$" : "L"} {Number(p.price).toLocaleString()}
                </p>
                <h3 className="font-body font-medium text-sm mt-1">{p.title}</h3>
                <div className="flex items-center gap-1 mt-2 text-xs font-body" style={{ color: "#6B7280" }}>
                  <MapPin className="w-3.5 h-3.5" />
                  {p.city}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs font-body" style={{ borderColor: "#E5E7EB", color: "#6B7280" }}>
                  <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {p.bedrooms}</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {p.bathrooms}</span>
                  {p.area_m2 && <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {p.area_m2} m²</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
