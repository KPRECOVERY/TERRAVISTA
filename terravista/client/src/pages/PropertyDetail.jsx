import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Ruler, Car, ArrowLeft, Phone, Mail, Check } from "lucide-react";
import RoofMark from "../components/RoofMark.jsx";
import { api } from "../services/api.js";

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getProperty(id)
      .then((res) => setProperty(res.data))
      .catch(() => setError("Propiedad no encontrada"));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: "#6B7280" }}>
        {error} — <Link to="/" className="ml-1 underline">volver al catálogo</Link>
      </div>
    );
  }
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: "#6B7280" }}>
        Cargando propiedad...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#FAFAF8", color: "#1F2937" }}>
      <header className="sticky top-0 z-20 border-b backdrop-blur-md" style={{ borderColor: "#E5E7EB", backgroundColor: "rgba(250,250,248,0.85)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <RoofMark className="w-7 h-4" style={{ color: "#0F766E" }} />
            Terravista
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full hover:bg-black/5" style={{ color: "#6B7280" }}>
            <ArrowLeft className="w-4 h-4" /> Volver a resultados
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="relative h-[420px]" style={{ backgroundColor: "#F3F4F6" }}>
            {property.images?.[activeImg] && (
              <img src={property.images[activeImg].url} alt={property.title} className="w-full h-full object-cover" />
            )}
          </div>
          {property.images?.length > 1 && (
            <div className="flex gap-2 p-3">
              {property.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0"
                  style={{ opacity: activeImg === i ? 1 : 0.5, outline: activeImg === i ? "2px solid #0F766E" : "none" }}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display font-extrabold text-3xl">{property.title}</h1>
                <div className="flex items-center gap-1.5 mt-2 text-sm" style={{ color: "#6B7280" }}>
                  <MapPin className="w-4 h-4" /> {property.address}, {property.city}
                </div>
              </div>
              <p className="font-display font-extrabold text-2xl whitespace-nowrap" style={{ color: "#0F766E" }}>
                {property.currency === "USD" ? "$" : "L"} {Number(property.price).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-5 rounded-2xl border" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
              {[
                [BedDouble, property.bedrooms, "Habitaciones"],
                [Bath, property.bathrooms, "Baños"],
                [Ruler, property.area_m2 ? `${property.area_m2} m²` : "—", "Construcción"],
                [Car, property.parking, "Parqueos"],
              ].map(([Icon, val, label], i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <Icon className="w-5 h-5" style={{ color: "#0F766E" }} />
                  <p className="font-display font-bold text-sm">{val}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>{label}</p>
                </div>
              ))}
            </div>

            {property.description && (
              <div className="mt-8">
                <h2 className="font-display font-bold text-lg mb-3">Descripción</h2>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{property.description}</p>
              </div>
            )}

            {property.amenities?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display font-bold text-lg mb-4">Comodidades</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#0F766E" }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            {property.agent ? (
              <div className="sticky top-24 rounded-2xl border p-6" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
                <p className="font-display font-semibold text-sm">{property.agent.name}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>{property.agent.role}</p>
                <div className="mt-5 flex flex-col gap-2.5">
                  <a
                    href={`tel:${property.agent.phone}`}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white py-3 rounded-full"
                    style={{ backgroundColor: "#0F766E" }}
                  >
                    <Phone className="w-4 h-4" /> {property.agent.phone}
                  </a>
                  <a
                    href={`mailto:${property.agent.email}`}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-full border"
                    style={{ borderColor: "#E5E7EB" }}
                  >
                    <Mail className="w-4 h-4" /> Enviar mensaje
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border p-6 text-sm" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF", color: "#6B7280" }}>
                Sin agente asignado todavía.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
