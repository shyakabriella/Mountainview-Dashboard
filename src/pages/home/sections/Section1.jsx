import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, Upload, Trash2, Image as ImageIcon, AlertCircle, Edit2 } from "lucide-react";

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

export default function Section1() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchCards();
    } else {
      setError("Please login first");
      setLoading(false);
    }
  }, []);

  const fetchCards = async () => {
    try {
      const result = await apiRequest("/home-section1-gallery", "GET");
      console.log("Fetched cards:", result);
      
      if (result.success && result.data && result.data.length > 0) {
        const loadedItems = result.data.map((card) => ({
          id: card.id,
          title: card.title,
          image: card.image_url,
          imagePreview: card.image_url ? getImageUrl(card.image_url) : null,
          imageFile: null,
        }));
        setItems(loadedItems);
        setDeletedImages([]);
      } else {
        setItems([
          { id: null, title: "ROOMS", image: null, imagePreview: null, imageFile: null },
          { id: null, title: "SWIMMING POOL", image: null, imagePreview: null, imageFile: null },
          { id: null, title: "RESTAURANT", image: null, imagePreview: null, imageFile: null },
          { id: null, title: "STUNNING CITY & MOUNTAIN VIEW", image: null, imagePreview: null, imageFile: null },
        ]);
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
      setError("Failed to load gallery cards");
      setItems([
        { id: null, title: "ROOMS", image: null, imagePreview: null, imageFile: null },
        { id: null, title: "SWIMMING POOL", image: null, imagePreview: null, imageFile: null },
        { id: null, title: "RESTAURANT", image: null, imagePreview: null, imageFile: null },
        { id: null, title: "STUNNING CITY & MOUNTAIN VIEW", image: null, imagePreview: null, imageFile: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, updates) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const startEditing = (index, currentTitle) => {
    setEditingIndex(index);
    setEditValue(currentTitle);
  };

  const saveTitle = (index) => {
    if (editValue && editValue.trim() && editValue !== items[index]?.title) {
      updateItem(index, { title: editValue.trim() });
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitle(index);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
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
    setError(null);
    
    const previewUrl = URL.createObjectURL(file);
    updateItem(index, {
      imagePreview: previewUrl,
      imageFile: file,
    });

    const item = items[index];
    
    if (item.id) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        
        const result = await apiRequest(`/admin/home-section1-gallery/${item.id}/upload`, "POST", formData, token, true);
        
        if (result.success) {
          updateItem(index, {
            image: result.data.image_url,
            imagePreview: getImageUrl(result.data.image_url),
            imageFile: null,
          });
        } else {
          setError("Failed to upload image");
          updateItem(index, { imagePreview: null, imageFile: null });
        }
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload image");
        updateItem(index, { imagePreview: null, imageFile: null });
      }
    }
    
    setUploadingIndex(null);
  };

  const removeImage = (index) => {
    const item = items[index];
    
    if (item.imagePreview && item.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(item.imagePreview);
    }
    
    // Mark for deletion if it has an ID and has an image
    if (item.id && item.image) {
      setDeletedImages(prev => [...prev, item.id]);
    }
    
    updateItem(index, {
      image: null,
      imagePreview: null,
      imageFile: null,
    });
    
    setHasChanges(true);
  };

  const saveAllCards = async () => {
    setSaving(true);
    setError(null);

    try {
      // First, handle image deletions (if any)
      if (deletedImages.length > 0) {
        const deletePayload = { delete_images: deletedImages };
        await apiRequest("/admin/home-section1-gallery", "POST", deletePayload, token);
      }
      
      // Then save all titles
      const cardsData = items.map((item) => ({
        id: item.id,
        title: item.title,
      }));

      const result = await apiRequest("/admin/home-section1-gallery", "POST", { cards: cardsData }, token);
      
      if (result.success) {
        const updatedItems = items.map((item, index) => ({
          ...item,
          id: result.data[index]?.id || item.id,
        }));
        setItems(updatedItems);
        
        // Upload any pending images for new cards
        for (let i = 0; i < updatedItems.length; i++) {
          const item = updatedItems[i];
          if (item.imageFile && item.id) {
            const formData = new FormData();
            formData.append("image", item.imageFile);
            
            await apiRequest(`/admin/home-section1-gallery/${item.id}/upload`, "POST", formData, token, true);
            
            // Update the item after successful upload
            updatedItems[i] = {
              ...updatedItems[i],
              imageFile: null,
            };
          }
        }
        
        setItems(updatedItems);
        setDeletedImages([]);
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchCards();
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save changes: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchCards();
    setHasChanges(false);
    setError(null);
    setEditingIndex(null);
    setEditValue("");
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
          <p className="mt-2 text-slate-500">Please login to manage gallery cards.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Section 1 - Gallery Cards</h1>
            <p className="mt-1 text-sm text-slate-500">Manage the 4 gallery cards with images and titles</p>
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
              onClick={saveAllCards}
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Gallery Cards (4 Items)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div key={item.id || index} className="border rounded-xl overflow-hidden bg-gray-50">
              <div className="relative h-48 bg-gray-100">
                {item.imagePreview ? (
                  <>
                    <img
                      src={item.imagePreview}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                    {deletedImages.includes(item.id) && (
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
              </div>

              <div className="p-4">
                <div className="mb-3">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveTitle(index)}
                      onKeyDown={(e) => handleKeyPress(e, index)}
                      className="w-full font-bold text-slate-900 border rounded-lg px-2 py-1 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900 break-words flex-1">{item.title}</h3>
                      <button
                        onClick={() => startEditing(index, item.title)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 text-emerald-600 hover:bg-emerald-200 transition text-xs font-medium"
                        type="button"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                
                <label className="cursor-pointer block w-full">
                  <div className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    item.imagePreview
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                  }`}>
                    {uploadingIndex === index ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Upload size={14} />
                    )}
                    {item.imagePreview ? "Change Image" : "Upload Image"}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Click "Edit" to change titles. Upload images. Click trash icon then Save Changes to permanently delete an image.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Live Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div key={item.id || index} className="group relative overflow-hidden rounded-xl shadow-lg">
              {item.imagePreview ? (
                <>
                  <img
                    src={item.imagePreview}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg text-center">{item.title}</h3>
                  </div>
                </>
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-xl">
                  <p className="text-gray-400 text-center p-4">{item.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">How to delete images:</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Click the trash icon on any card image</li>
              <li>• The image will show "Will be deleted" badge</li>
              <li>• Click "Save Changes" to permanently delete the image</li>
              <li>• After saving, refresh the page to confirm deletion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}