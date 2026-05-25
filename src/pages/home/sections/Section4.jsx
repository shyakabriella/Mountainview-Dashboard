import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Upload, Trash2, Image as ImageIcon, Plus } from "lucide-react";

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

export default function Section4() {
  const [sectionData, setSectionData] = useState({
    title: "Relax & Rejuvenate",
    subtitle: "Swimming Pool",
    description: "Relax at our outdoor pool, surrounded by stunning mountain views. Take a refreshing swim, bask in the sun, or sip a cocktail by the water — the perfect retreat awaits.",
    bullet_points: [
      "Olympic-size pool with mountain views",
      "Comfortable sun loungers and umbrellas",
      "Poolside bar with refreshing drinks",
      "Heated pool for year-round enjoyment"
    ],
    button_text: "Explore Pool",
    button_link: "/pool",
    images: [null, null, null, null],
    imagePreviews: [null, null, null, null]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [pendingImages, setPendingImages] = useState({});
  const [deletedImages, setDeletedImages] = useState([]);
  const [newBulletPoint, setNewBulletPoint] = useState("");

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
      const result = await apiRequest("/home-section4", "GET");
      console.log("Fetched section 4 data:", result);
      
      if (result.success && result.data) {
        const images = result.data.images || [null, null, null, null];
        const imagePreviews = images.map(img => img ? getImageUrl(img) : null);
        
        setSectionData({
          ...result.data,
          images: images,
          imagePreviews: imagePreviews,
          bullet_points: result.data.bullet_points || []
        });
        setPendingImages({});
        setDeletedImages([]);
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setSectionData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const updateBulletPoint = (index, value) => {
    const newPoints = [...sectionData.bullet_points];
    newPoints[index] = value;
    updateField("bullet_points", newPoints);
  };

  const addBulletPoint = () => {
    if (newBulletPoint.trim()) {
      updateField("bullet_points", [...sectionData.bullet_points, newBulletPoint.trim()]);
      setNewBulletPoint("");
    }
  };

  const removeBulletPoint = (index) => {
    const newPoints = [...sectionData.bullet_points];
    newPoints.splice(index, 1);
    updateField("bullet_points", newPoints);
  };

  const handleImageUpload = async (position, file) => {
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

    setUploadingIndex(position);
    
    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    const newPreviews = [...sectionData.imagePreviews];
    newPreviews[position] = previewUrl;
    setSectionData(prev => ({ ...prev, imagePreviews: newPreviews }));
    
    // Mark as pending upload
    setPendingImages(prev => ({ ...prev, [position]: file }));
    setHasChanges(true);
    
    setUploadingIndex(null);
  };

  const removeImage = (position) => {
    // If there's a saved image, mark it for deletion
    if (sectionData.images[position]) {
      setDeletedImages(prev => [...prev, position]);
    }
    
    // Remove pending image if any
    if (pendingImages[position]) {
      const newPending = { ...pendingImages };
      delete newPending[position];
      setPendingImages(newPending);
    }
    
    // Clear preview
    const newPreviews = [...sectionData.imagePreviews];
    newPreviews[position] = null;
    setSectionData(prev => ({ ...prev, imagePreviews: newPreviews }));
    
    setHasChanges(true);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      // First, upload pending images
      for (const [position, file] of Object.entries(pendingImages)) {
        const formData = new FormData();
        formData.append("image", file);
        
        const result = await apiRequest(`/admin/home-section4/image/${position}`, "POST", formData, token, true);
        if (result && result.success) {
          const newImages = [...sectionData.images];
          const newPreviews = [...sectionData.imagePreviews];
          newImages[position] = result.data.image_url;
          newPreviews[position] = result.data.image_url;
          setSectionData(prev => ({ ...prev, images: newImages, imagePreviews: newPreviews }));
        }
      }
      
      // Then, delete marked images
      for (const position of deletedImages) {
        await apiRequest(`/admin/home-section4/image/${position}`, "DELETE", null, token);
        const newImages = [...sectionData.images];
        const newPreviews = [...sectionData.imagePreviews];
        newImages[position] = null;
        newPreviews[position] = null;
        setSectionData(prev => ({ ...prev, images: newImages, imagePreviews: newPreviews }));
      }
      
      // Finally, save text data
      const data = {
        title: sectionData.title,
        subtitle: sectionData.subtitle,
        description: sectionData.description,
        bullet_points: sectionData.bullet_points,
        button_text: sectionData.button_text,
        button_link: sectionData.button_link,
      };

      const result = await apiRequest("/admin/home-section4", "POST", data, token);
      
      if (result.success) {
        setPendingImages({});
        setDeletedImages([]);
        setHasChanges(false);
        setSaved(true);
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

  const handleReset = () => {
    fetchData();
    setHasChanges(false);
    setError(null);
    setPendingImages({});
    setDeletedImages([]);
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
          <p className="mt-2 text-slate-500">Please login to manage section 4.</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Section 4 - Swimming Pool</h1>
            <p className="mt-1 text-sm text-slate-500">Manage the swimming pool section with images and content</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Check size={16} />
                Saved successfully
              </span>
            )}
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>
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
        {/* Left Side - Images Gallery */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Gallery Images (4 Images)</h2>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((position) => (
                <div key={position} className="border rounded-xl overflow-hidden bg-gray-50">
                  <div className="relative h-40 bg-gray-100">
                    {sectionData.imagePreviews[position] ? (
                      <>
                        <img
                          src={sectionData.imagePreviews[position]}
                          alt={`Gallery ${position + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(position)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                        {deletedImages.includes(position) && (
                          <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                            Will be deleted
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={48} className="text-gray-300" />
                      </div>
                    )}
                    <label className="absolute bottom-2 right-2 cursor-pointer">
                      <div className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition">
                        <Upload size={12} />
                        {uploadingIndex === position ? "..." : "Upload"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(position, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs text-slate-500">Image {position + 1}</p>
                    {pendingImages[position] && (
                      <p className="text-xs text-emerald-500 mt-1">Pending upload</p>
                    )}
                    {deletedImages.includes(position) && (
                      <p className="text-xs text-red-500 mt-1">Will be deleted</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Upload 4 images for the swimming pool gallery. Images save when you click "Save Changes".
            </p>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Section Header</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={sectionData.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                  placeholder="Relax & Rejuvenate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={sectionData.subtitle || ""}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                  placeholder="Swimming Pool"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={sectionData.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none resize-y"
                  placeholder="Enter description..."
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Bullet Points (Features)</h2>
            <div className="space-y-3">
              {sectionData.bullet_points && sectionData.bullet_points.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updateBulletPoint(index, e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                  />
                  <button
                    onClick={() => removeBulletPoint(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                  <Plus size={14} />
                </div>
                <input
                  type="text"
                  value={newBulletPoint}
                  onChange={(e) => setNewBulletPoint(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBulletPoint()}
                  placeholder="Add new feature..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                />
                <button
                  onClick={addBulletPoint}
                  className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">Button Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Button Text</label>
                <input
                  type="text"
                  value={sectionData.button_text || ""}
                  onChange={(e) => updateField("button_text", e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                  placeholder="Explore Pool"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Button Link</label>
                <input
                  type="text"
                  value={sectionData.button_link || ""}
                  onChange={(e) => updateField("button_link", e.target.value)}
                  className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                  placeholder="/pool"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Live Preview</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((position) => (
              <div key={position} className="rounded-xl overflow-hidden h-32">
                {sectionData.imagePreviews[position] ? (
                  <img
                    src={sectionData.imagePreviews[position]}
                    alt={`Preview ${position + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wider mb-2">
              {sectionData.subtitle}
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">{sectionData.title}</h3>
            <p className="text-slate-600 mb-4">{sectionData.description}</p>
            <ul className="space-y-2 mb-6">
              {sectionData.bullet_points && sectionData.bullet_points.map((point, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
                  <span className="text-slate-600">{point}</span>
                </li>
              ))}
            </ul>
            <button className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition">
              {sectionData.button_text || "Explore Pool"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">How it works</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Upload images - they will be saved when you click "Save Changes"</li>
              <li>• Edit titles, descriptions, and bullet points - changes tracked automatically</li>
              <li>• Click trash icon to mark images for deletion (shows "Will be deleted")</li>
              <li>• Save button activates only when there are actual changes</li>
              <li>• Click "Save Changes" to save everything (images + text) at once</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}