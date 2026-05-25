import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Upload, Trash2, Image as ImageIcon, Type } from "lucide-react";

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

export default function ConferenceHeroSection() {
  const [data, setData] = useState({
    id: null,
    title: "Events & Conferences",
    subtitle: "Home / Conferences",
    description: "Elegant spaces designed for meetings, weddings, and unforgettable events.",
    background_image: null,
    imagePreview: null,
    imageFile: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchData();
    } else {
      setError("Please login first");
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      const result = await apiRequest("/conference-hero", "GET");
      if (result.success && result.data) {
        setData({
          id: result.data.id || null,
          title: result.data.title || "Events & Conferences",
          subtitle: result.data.subtitle || "Home / Conferences",
          description: result.data.description || "",
          background_image: result.data.background_image,
          imagePreview: result.data.background_image ? getImageUrl(result.data.background_image) : null,
          imageFile: null,
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const handleImageUpload = async (file) => {
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

    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    setData(prev => ({ ...prev, imagePreview: previewUrl, imageFile: file }));
    setHasChanges(true);
    setUploading(false);
  };

  const removeImage = () => {
    if (data.imagePreview && data.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(data.imagePreview);
    }
    setData(prev => ({ ...prev, background_image: null, imagePreview: null, imageFile: null }));
    setHasChanges(true);
  };

  const saveToBackend = async () => {
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle || "Home / Conferences");
      formData.append("description", data.description || "");
      
      if (data.imageFile) {
        formData.append("image", data.imageFile);
      } else if (data.background_image && !data.background_image.startsWith('blob:')) {
        formData.append("background_image", data.background_image);
      }

      let result;
      if (data.id) {
        formData.append("_method", "PUT");
        result = await apiRequest(`/admin/conference-hero/${data.id}`, "POST", formData, token, true);
      } else {
        result = await apiRequest("/admin/conference-hero", "POST", formData, token, true);
      }

      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchData();
      } else {
        setError(result.message || "Error saving");
      }
    } catch (err) {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchData();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-slate-500">Please login to manage conference hero section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Conference Hero Section</h2>
        <div className="flex gap-2">
          {saved && <span className="text-emerald-600 text-sm flex items-center gap-1"><Check size={14} /> Saved!</span>}
          <button onClick={handleReset} className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"><RotateCcw size={15} /> Reset</button>
          <button onClick={saveToBackend} disabled={!hasChanges || saving} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${hasChanges && !saving ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" : "bg-gray-300 cursor-not-allowed"}`}>
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input value={data.title} onChange={(e) => updateField("title", e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle (Breadcrumb)</label>
          <input value={data.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Home / Conferences" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={data.description} onChange={(e) => updateField("description", e.target.value)} rows={3} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Background Image</label>
          <div className="border rounded-lg p-4 bg-gray-50">
            {data.imagePreview ? (
              <div className="relative">
                <img src={data.imagePreview} className="w-full h-48 object-cover rounded-lg" />
                <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon size={48} className="text-gray-300" />
              </div>
            )}
            <label className="cursor-pointer block w-full mt-3">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 text-sm font-medium">
                {uploading ? "Uploading..." : (data.imagePreview ? "Change Image" : "Upload Image")}
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border p-6 text-center">
        <div className="relative h-48 bg-gray-800 rounded-lg overflow-hidden">
          {data.imagePreview && <img src={data.imagePreview} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
            <p className="text-white/80 text-sm">{data.subtitle}</p>
            <h1 className="text-3xl font-bold text-white mt-2">{data.title}</h1>
            <p className="text-white/80 text-sm mt-2 max-w-md">{data.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}