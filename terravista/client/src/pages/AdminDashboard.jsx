import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Plus, Pencil, Trash2, X, Search, LogOut, ImageIcon, Star, UploadCloud, Check,
} from "lucide-react";
import RoofMark from "../components/RoofMark.jsx";
import { api } from "../services/api.js";

const emptyForm = {
  title: "", price: "", currency: "HNL", property_type: "casa", status: "venta",
  bedrooms: 0, bathrooms: 0, area_m2: "", address: "", city: "", featured: false, description: "",
};

const STATUS_LABELS = { venta: "Venta", renta: "Renta", vendida: "Vendida", reservada: "Reservada" };
const STATUS_COLORS = {
  venta: { bg: "#ECFDF5", text: "#0F766E" },
  renta: { bg: "#EFF6FF", text: "#1D4ED8" },
  vendida: { bg: "#F3F4F6", text: "#6B7280" },
  reservada: { bg: "#FFFBEB", text: "#B45309" },
};

export default function AdminDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // objeto propiedad completo, o null si es "crear"
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadProperties = () => {
    setLoading(true);
    api
      .listAllPropertiesAdmin() // el admin ve TODAS las propiedades, incluyendo vendidas/reservadas
      .then((res) => setProperties(res.data))
      .catch(() => showToast("No se pudo cargar el catálogo"))
      .finally(() => setLoading(false));
  };

  useEffect(loadProperties, []);

  const filtered = properties.filter(
    (p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({ ...emptyForm, ...p });
    setEditing(p);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.price || !form.address?.trim() || !form.city?.trim()) {
      showToast("Completa los campos obligatorios");
      return;
    }
    try {
      if (editing) {
        await api.updateProperty(editing.id, form);
        showToast("Propiedad actualizada");
      } else {
        const created = await api.createProperty(form);
        showToast("Propiedad creada. Ahora agrega sus fotos.");
        setEditing(created.data); // se queda en el modal para subir imágenes de una vez
        loadProperties();
        return;
      }
      setModalOpen(false);
      loadProperties();
    } catch (err) {
      showToast(err.message || "No se pudo guardar");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteProperty(id);
      setConfirmDeleteId(null);
      showToast("Propiedad eliminada");
      loadProperties();
    } catch (err) {
      showToast(err.message || "No se pudo eliminar");
    }
  };

  const handleFiles = async (files) => {
    if (!editing?.id || !files?.length) return;
    setUploading(true);
    try {
      await api.uploadImages(editing.id, files);
      const refreshed = await api.getProperty(editing.id);
      setEditing(refreshed.data);
      loadProperties();
    } catch (err) {
      showToast(err.message || "No se pudieron subir las imágenes");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await api.deleteImage(editing.id, imageId);
      const refreshed = await api.getProperty(editing.id);
      setEditing(refreshed.data);
      loadProperties();
    } catch (err) {
      showToast(err.message || "No se pudo eliminar la imagen");
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen w-full font-body" style={{ backgroundColor: "#FAFAF8", color: "#1F2937" }}>
      <div className="flex">
        <aside className="hidden md:flex flex-col w-60 min-h-screen border-r p-6" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
          <div className="flex items-center gap-2 font-display font-bold text-lg mb-10">
            <RoofMark className="w-7 h-4" style={{ color: "#0F766E" }} />
            Terravista
          </div>
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <a className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg" style={{ backgroundColor: "#ECFDF5", color: "#0F766E" }}>
              <Home className="w-4 h-4" /> Propiedades
            </a>
          </nav>
          <button onClick={handleLogout} className="mt-auto flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5" style={{ color: "#6B7280" }}>
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-extrabold text-2xl">Catálogo de propiedades</h1>
              <p className="text-sm mt-1" style={{ color: "#6B7280" }}>{properties.length} propiedades en total</p>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full self-start sm:self-auto" style={{ backgroundColor: "#0F766E" }}>
              <Plus className="w-4 h-4" /> Nueva propiedad
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full border mb-6 max-w-sm" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
            <Search className="w-4 h-4" style={{ color: "#6B7280" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o ciudad..." className="w-full text-sm outline-none bg-transparent" />
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
            {loading ? (
              <p className="px-5 py-10 text-center text-sm" style={{ color: "#6B7280" }}>Cargando...</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b" style={{ borderColor: "#E5E7EB" }}>
                    <th className="px-5 py-3.5 font-medium" style={{ color: "#6B7280" }}>Propiedad</th>
                    <th className="px-5 py-3.5 font-medium" style={{ color: "#6B7280" }}>Ciudad</th>
                    <th className="px-5 py-3.5 font-medium" style={{ color: "#6B7280" }}>Precio</th>
                    <th className="px-5 py-3.5 font-medium" style={{ color: "#6B7280" }}>Estado</th>
                    <th className="px-5 py-3.5 font-medium" style={{ color: "#6B7280" }}>Destacada</th>
                    <th className="px-5 py-3.5 font-medium text-right" style={{ color: "#6B7280" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-0" style={{ borderColor: "#E5E7EB" }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: "#F3F4F6" }}>
                            {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-4 h-4" style={{ color: "#9CA3AF" }} /></div>}
                          </div>
                          <div>
                            <p className="font-medium">{p.title}</p>
                            <p className="text-xs capitalize" style={{ color: "#6B7280" }}>{p.property_type} · {p.bedrooms} hab</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: "#6B7280" }}>{p.city}</td>
                      <td className="px-5 py-3.5 font-medium">{p.currency === "USD" ? "$" : "L"} {Number(p.price).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: STATUS_COLORS[p.status]?.bg, color: STATUS_COLORS[p.status]?.text }}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">{p.featured ? <Star className="w-4 h-4" style={{ color: "#0F766E", fill: "#0F766E" }} /> : null}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5" aria-label="Editar">
                            <Pencil className="w-4 h-4" style={{ color: "#6B7280" }} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50" aria-label="Eliminar">
                            <Trash2 className="w-4 h-4" style={{ color: "#DC2626" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "#6B7280" }}>No se encontraron propiedades.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(31,41,55,0.4)" }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
              <h2 className="font-display font-bold text-lg">{editing ? "Editar propiedad" : "Nueva propiedad"}</h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <Field label="Título *"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" /></Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio *"><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" /></Field>
                <Field label="Moneda">
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input">
                    <option value="HNL">Lempiras (HNL)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo">
                  <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className="input">
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="local">Local comercial</option>
                    <option value="otro">Otro</option>
                  </select>
                </Field>
                <Field label="Estado">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                    <option value="venta">Venta</option>
                    <option value="renta">Renta</option>
                    <option value="vendida">Vendida</option>
                    <option value="reservada">Reservada</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Habitaciones"><input type="number" min="0" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="input" /></Field>
                <Field label="Baños"><input type="number" min="0" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="input" /></Field>
                <Field label="Área m²"><input type="number" min="0" value={form.area_m2} onChange={(e) => setForm({ ...form, area_m2: e.target.value })} className="input" /></Field>
              </div>

              <Field label="Dirección *"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" /></Field>
              <Field label="Ciudad *"><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" /></Field>
              <Field label="Descripción"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[90px] resize-none" /></Field>

              <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer select-none">
                <button type="button" onClick={() => setForm({ ...form, featured: !form.featured })} className="w-5 h-5 rounded flex items-center justify-center border" style={{ borderColor: form.featured ? "#0F766E" : "#E5E7EB", backgroundColor: form.featured ? "#0F766E" : "transparent" }}>
                  {form.featured && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
                Marcar como propiedad destacada
              </label>

              {/* Imágenes: solo disponible una vez que la propiedad existe (tiene id) */}
              <div className="pt-2 border-t" style={{ borderColor: "#E5E7EB" }}>
                <p className="text-xs font-medium mt-4 mb-2" style={{ color: "#6B7280" }}>Fotos de la propiedad</p>

                {!editing?.id ? (
                  <p className="text-xs italic" style={{ color: "#9CA3AF" }}>
                    Guarda la propiedad primero para poder subir fotos.
                  </p>
                ) : (
                  <>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        handleFiles(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors"
                      style={{ borderColor: dragActive ? "#0F766E" : "#E5E7EB", backgroundColor: dragActive ? "#ECFDF5" : "#FAFAF8" }}
                    >
                      <UploadCloud className="w-6 h-6" style={{ color: "#0F766E" }} />
                      <p className="text-sm font-medium">{uploading ? "Subiendo..." : "Arrastra imágenes aquí o haz clic"}</p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>JPG, PNG o WEBP · máx. 5MB cada una</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                    </div>

                    {editing.images?.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {editing.images.map((img) => (
                          <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square" style={{ backgroundColor: "#F3F4F6" }}>
                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => handleDeleteImage(img.id)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Eliminar imagen"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t sticky bottom-0" style={{ borderColor: "#E5E7EB", backgroundColor: "#FFFFFF" }}>
              <button onClick={() => setModalOpen(false)} className="text-sm font-medium px-5 py-2.5 rounded-full border hover:bg-black/5" style={{ borderColor: "#E5E7EB" }}>Cerrar</button>
              <button onClick={handleSave} className="text-sm font-semibold text-white px-6 py-2.5 rounded-full" style={{ backgroundColor: "#0F766E" }}>
                {editing ? "Guardar cambios" : "Crear propiedad"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(31,41,55,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="font-display font-bold text-lg">¿Eliminar propiedad?</h3>
            <p className="text-sm mt-2" style={{ color: "#6B7280" }}>Esta acción no se puede deshacer. También se borrarán sus fotos del servidor.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setConfirmDeleteId(null)} className="text-sm font-medium px-5 py-2.5 rounded-full border hover:bg-black/5" style={{ borderColor: "#E5E7EB" }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="text-sm font-semibold text-white px-5 py-2.5 rounded-full" style={{ backgroundColor: "#DC2626" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-sm font-medium text-white px-5 py-3 rounded-full shadow-lg" style={{ backgroundColor: "#1F2937" }}>
          {toast}
        </div>
      )}

      <style>{`
        .input { width: 100%; font-size: 0.875rem; padding: 0.625rem 0.875rem; border-radius: 0.75rem; border: 1px solid #E5E7EB; outline: none; background-color: #FAFAF8; }
        .input:focus { border-color: #0F766E; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: "#6B7280" }}>{label}</label>
      {children}
    </div>
  );
}
