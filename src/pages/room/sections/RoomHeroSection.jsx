import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");
const STORAGE_URL = (import.meta.env.VITE_STORAGE_URL || `${APP_URL}/storage`).replace(/\/$/, "");

const getImageUrl = (path) => {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/storage/")) return `${APP_URL}${path}`;
  if (path.startsWith("storage/")) return `${APP_URL}/${path}`;
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
  if (method === "GET" && response.status === 404) return { success: false, data: null };
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return await response.json();
};

export default function RoomHeroSection() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "Stay With Us",
    subtitle: "Elegant & Comfortable Rooms",
    description: "Discover thoughtfully designed rooms that blend comfort, style, and modern convenience— offering the perfect space to relax, recharge, and enjoy every moment of your stay.",
    image_url: null,
    imagePreview: null,
    imageFile: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchHeroData();
    } else {
      setError("Please login first");
      setLoading(false);
    }
  }, []);

  const fetchHeroData = async () => {
    try {
      const result = await apiRequest("/room-hero-section", "GET");
      console.log("Fetched room hero data:", result);
      
      if (result.success && result.data) {
        setSectionData({
          id: result.data.id || null,
          title: result.data.title || "Stay With Us",
          subtitle: result.data.subtitle || "Elegant & Comfortable Rooms",
          description: result.data.description || "",
          image_url: result.data.image_url,
          imagePreview: result.data.image_url ? getImageUrl(result.data.image_url) : null,
          imageFile: null,
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching hero data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSectionData(prev => ({ ...prev, [field]: value }));
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
    setSectionData(prev => ({ ...prev, imagePreview: previewUrl, imageFile: file }));
    setHasChanges(true);
    setSaved(false);
    setError(null);
    setUploading(false);
  };

  const removeImage = () => {
    if (sectionData.imagePreview && sectionData.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(sectionData.imagePreview);
    }
    setSectionData(prev => ({ 
      ...prev, 
      image_url: null, 
      imagePreview: null, 
      imageFile: null 
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const saveToBackend = async () => {
    if (!sectionData.title) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", sectionData.title);
      formData.append("subtitle", sectionData.subtitle || "");
      formData.append("description", sectionData.description || "");
      
      if (sectionData.imageFile) {
        formData.append("image", sectionData.imageFile);
      } else if (sectionData.image_url && !sectionData.image_url.startsWith('blob:')) {
        formData.append("image_url", sectionData.image_url);
      }

      let result;
      if (sectionData.id) {
        formData.append("_method", "PUT");
        result = await apiRequest(`/admin/room-hero-section/${sectionData.id}`, "POST", formData, token, true);
      } else {
        result = await apiRequest("/admin/room-hero-section", "POST", formData, token, true);
      }

      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchHeroData();
      } else {
        setError(result.message || "Error saving hero section");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save hero section");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchHeroData();
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-slate-900">Authentication Required</h2>
          <p className="mt-2 text-slate-500">Please login to manage room hero section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Room Hero Section</h2>
          <p className="text-sm text-gray-500">Edit the room page hero banner</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleReset} 
            className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button 
            onClick={saveToBackend} 
            disabled={!hasChanges || saving} 
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              hasChanges && !saving
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700" 
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
            Save Changes
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <Check size={16} /> Room hero section saved successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Form */}
        <div className="space-y-4 bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              value={sectionData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Stay With Us"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              value={sectionData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Elegant & Comfortable Rooms"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={sectionData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none resize-y"
              placeholder="Enter hero description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-3">Hero Image</label>
            <div className="border rounded-lg p-4 bg-gray-50">
              {sectionData.imagePreview ? (
                <div className="relative">
                  <img
                    src={sectionData.imagePreview}
                    alt="Hero preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-300" />
                </div>
              )}
              <label className="cursor-pointer block w-full mt-3">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 text-sm font-medium hover:from-emerald-600 hover:to-emerald-700">
                  {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Upload size={14} />}
                  {uploading ? "Uploading..." : (sectionData.imagePreview ? "Change Image" : "Upload Image")}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-3">
                Recommended size: 1920x800px. Max 5MB. Supports JPG, PNG, WebP, GIF.
              </p>
            </div>
          </div>
        </div>

        {/* Right - Live Preview */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Live Preview</h3>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="relative h-80 overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
              {sectionData.imagePreview ? (
                <>
                  <img
                    src={sectionData.imagePreview}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="max-w-2xl px-6">
                  {sectionData.subtitle && (
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                      {sectionData.subtitle}
                    </p>
                  )}
                  {sectionData.title && (
                    <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                      {sectionData.title}
                    </h1>
                  )}
                  {sectionData.description && (
                    <p className="mb-6 text-sm text-white/90 md:text-base">
                      {sectionData.description}
                    </p>
                  )}
                  <button className="inline-block rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
                    Explore Rooms
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Upload a high-quality background image (1920x800px recommended)</li>
              <li>• Edit the title, subtitle, and description for the room hero section</li>
              <li>• The text appears centered over the image with a dark overlay</li>
              <li>• Click "Save Changes" to store everything in the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}