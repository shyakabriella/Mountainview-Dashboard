import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Upload, Trash2, Image as ImageIcon } from "lucide-react";

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
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  return await response.json();
};

export default function Section6() {
  const [sectionId, setSectionId] = useState(null);
  const [title, setTitle] = useState("We're Most Recommended Hotel");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

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
      const result = await apiRequest("/home-section6", "GET");
      console.log("Fetched section 6 data:", result);
      
      if (result.success && result.data) {
        setSectionId(result.data.id || null);
        setTitle(result.data.title || "We're Most Recommended Hotel");
        setBackgroundImage(result.data.background_image);
        setImagePreview(result.data.background_image ? getImageUrl(result.data.background_image) : null);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file) => {
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

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setBackgroundImage(null);
    setHasChanges(true);
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      if (imageFile) {
        formData.append("image", imageFile);
      } else if (backgroundImage) {
        formData.append("background_image", backgroundImage);
      }

      let result;
      if (sectionId) {
        formData.append("_method", "PUT");
        result = await apiRequest(`/admin/home-section6/${sectionId}`, "POST", formData, token, true);
      } else {
        result = await apiRequest("/admin/home-section6", "POST", formData, token, true);
      }
      
      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setImageFile(null);
        setTimeout(() => setSaved(false), 3000);
        await fetchData();
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save changes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!sectionId) {
      setError("No section to delete");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
      return;
    }
    
    setDeleting(true);
    setError(null);

    try {
      const result = await apiRequest(`/admin/home-section6/${sectionId}`, "DELETE", null, token);
      
      if (result.success) {
        setSectionId(null);
        setTitle("We're Most Recommended Hotel");
        setBackgroundImage(null);
        setImagePreview(null);
        setImageFile(null);
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete section: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleReset = () => {
    fetchData();
    setHasChanges(false);
    setError(null);
    setImageFile(null);
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
          <p className="mt-2 text-slate-500">Please login to manage section 6.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Section 6 - Recommended Hotel Banner</h1>
            <p className="mt-1 text-sm text-slate-500">Manage the background image and text for the recommendation banner</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Check size={16} />
                {sectionId ? "Updated successfully" : "Created successfully"}
              </span>
            )}
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>
            {sectionId && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" /> : <Trash2 size={15} />}
                Delete Section
              </button>
            )}
            <button
              onClick={saveAll}
              disabled={!hasChanges || saving}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all ${
                hasChanges && !saving
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98]"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Form */}
        <div className="space-y-5">
          {/* Title Input */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Banner Text</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title / Message</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasChanges(true);
                  setSaved(false);
                }}
                className="w-full text-xl font-bold text-slate-900 border rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                placeholder="We're Most Recommended Hotel"
              />
            </div>
          </div>

          {/* Background Image Upload */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Background Image</h2>
            <div className="border rounded-xl p-4 bg-gray-50">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Background preview"
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
                  <Upload size={14} />
                  Select Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-3">
                Recommended size: 1920x600px. Max 5MB. Supports JPG, PNG, WebP, GIF.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Live Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">Live Preview</h2>
          
          <div className="relative rounded-xl overflow-hidden h-64 bg-gray-800">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
                    {title || "We're Most Recommended Hotel"}
                  </h2>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-emerald-700 to-emerald-900">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
                  {title || "We're Most Recommended Hotel"}
                </h2>
              </div>
            )}
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
              <li>• Upload a high-quality background image (1920x600px recommended)</li>
              <li>• The text will appear centered over the image with a dark overlay</li>
              <li>• Edit the text to change what visitors see</li>
              <li>• If no image is uploaded, a gradient background will be shown</li>
              <li>• Click "Save Changes" to store everything in the database</li>
              <li>• Use "Delete Section" to remove the entire section</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}   