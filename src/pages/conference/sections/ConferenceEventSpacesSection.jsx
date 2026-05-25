import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Upload, Trash2, Image as ImageIcon, Edit2 } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");
const STORAGE_URL = (import.meta.env.VITE_STORAGE_URL || `${APP_URL}/storage`).replace(/\/$/, "");

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/storage")) return `${APP_URL}${path}`;
  return `${STORAGE_URL}/${path}`;
};

const apiRequest = async (url, method = "GET", body = null, token = null, isFormData = false) => {
  const options = { method, headers: { Accept: "application/json" } };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (body) {
    if (isFormData) options.body = body;
    else {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }
  const response = await fetch(`${API_URL}${url}`, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
};

export default function ConferenceEventSpacesSection() {
  const [spaces, setSpaces] = useState([
    { id: null, title: "Main Conference Hall", description: "Ideal for large events, seminars, and corporate gatherings.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Meeting Rooms", description: "Perfect for business meetings and private discussions.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Weddings & Celebrations", description: "Celebrate unforgettable moments in a beautiful and elegant setting.", image_url: null, image_preview: null, image_file: null },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchSpaces();
    } else {
      setError("Please login first");
      setLoading(false);
    }
  }, []);

  const fetchSpaces = async () => {
    try {
      const result = await apiRequest("/conference-event-spaces", "GET");
      if (result.success && result.data && result.data.length > 0) {
        setSpaces(result.data.map(space => ({
          ...space,
          image_preview: space.image_url ? getImageUrl(space.image_url) : null,
          image_file: null,
        })));
      }
    } catch (err) {
      console.error("Error fetching spaces:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSpace = (index, updates) => {
    const newSpaces = [...spaces];
    newSpaces[index] = { ...newSpaces[index], ...updates };
    setSpaces(newSpaces);
    setHasChanges(true);
    setSaved(false);
  };

  const startEditing = (index, field, value) => {
    setEditingIndex(index);
    setEditField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (editValue.trim() !== spaces[editingIndex][editField]) {
      updateSpace(editingIndex, { [editField]: editValue.trim() });
    }
    setEditingIndex(null);
    setEditField(null);
    setEditValue("");
  };

  const handleImageUpload = async (index, file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploadingIndex(index);
    const previewUrl = URL.createObjectURL(file);
    updateSpace(index, { image_preview: previewUrl, image_file: file });

    const space = spaces[index];
    if (space.id) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const result = await apiRequest(`/admin/conference-event-spaces/${space.id}/upload`, "POST", formData, token, true);
        if (result.success) {
          updateSpace(index, { image_url: result.data.image_url, image_preview: result.data.image_url, image_file: null });
        }
      } catch (err) {
        setError("Failed to upload image");
      }
    }
    setUploadingIndex(null);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const spacesData = spaces.map(space => ({
        id: space.id,
        title: space.title,
        description: space.description,
      }));

      const result = await apiRequest("/admin/conference-event-spaces", "POST", { spaces: spacesData }, token);
      
      if (result.success) {
        const updatedSpaces = spaces.map((space, i) => ({
          ...space,
          id: result.data[i]?.id || space.id,
        }));
        setSpaces(updatedSpaces);

        for (let i = 0; i < updatedSpaces.length; i++) {
          if (updatedSpaces[i].image_file && updatedSpaces[i].id) {
            const formData = new FormData();
            formData.append("image", updatedSpaces[i].image_file);
            await apiRequest(`/admin/conference-event-spaces/${updatedSpaces[i].id}/upload`, "POST", formData, token, true);
          }
        }

        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchSpaces();
      }
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSpaces();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-slate-500">Please login to manage event spaces.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Event Spaces (3 Items)</h2>
        <div className="flex gap-2">
          {saved && <span className="text-emerald-600 text-sm flex items-center gap-1"><Check size={14} /> Saved!</span>}
          <button onClick={handleReset} className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"><RotateCcw size={15} /> Reset</button>
          <button onClick={saveAll} disabled={!hasChanges || saving} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${hasChanges && !saving ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" : "bg-gray-300 cursor-not-allowed"}`}>
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {spaces.map((space, index) => (
          <div key={space.id || index} className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="relative h-48 bg-gray-100">
              {space.image_preview ? (
                <>
                  <img src={space.image_preview} className="w-full h-full object-cover" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-gray-300" /></div>
              )}
              <label className="absolute bottom-2 right-2 cursor-pointer">
                <div className="bg-black/60 hover:bg-black/80 text-white px-3 py-1 rounded-lg text-xs">
                  {uploadingIndex === index ? "..." : "Upload"}
                </div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files[0])} className="hidden" />
              </label>
            </div>
            <div className="p-4">
              {editingIndex === index && editField === "title" ? (
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} className="w-full font-bold border rounded px-2 py-1 mb-2" autoFocus />
              ) : (
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900">{space.title}</h3>
                  <button onClick={() => startEditing(index, "title", space.title)} className="text-slate-400 hover:text-emerald-500"><Edit2 size={14} /></button>
                </div>
              )}
              {editingIndex === index && editField === "description" ? (
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} rows={3} className="w-full text-sm border rounded px-2 py-1 mt-2" autoFocus />
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-slate-500 line-clamp-3">{space.description}</p>
                  <button onClick={() => startEditing(index, "description", space.description)} className="text-xs text-emerald-500 mt-1 hover:text-emerald-600">Edit description</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}