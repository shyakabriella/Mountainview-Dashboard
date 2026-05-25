import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Upload, Trash2, Image as ImageIcon, Edit2 } from "lucide-react";

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

export default function Section3() {
  const [sectionData, setSectionData] = useState({
    section_title: "Our Accommodations",
    section_subtitle: "Find Your Perfect Stay",
    hero_title: "MountainView",
    hero_description: "Experience comfort, elegance, and exceptional hospitality in every stay.",
    hero_image: null,
    hero_image_preview: null,
    cards: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingCardIndex, setUploadingCardIndex] = useState(null);
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [imagesToDelete, setImagesToDelete] = useState([]);

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
      const result = await apiRequest("/home-section3", "GET");
      console.log("Fetched section 3 data:", result);
      
      if (result.success && result.data) {
        setSectionData({
          ...result.data,
          hero_image_preview: result.data.hero_image ? getImageUrl(result.data.hero_image) : null,
          cards: result.data.cards && result.data.cards.length > 0 ? result.data.cards : [
            { id: null, title: "Deluxe Double Room", image_url: null },
            { id: null, title: "Deluxe Twin Room", image_url: null },
            { id: null, title: "Executive Suite", image_url: null },
            { id: null, title: "Executive Room", image_url: null },
            { id: null, title: "One Bedroom Apartment", image_url: null },
            { id: null, title: "Two Bedroom Apartment", image_url: null },
            { id: null, title: "Three Bedroom Apartment", image_url: null },
          ]
        });
        setImagesToDelete([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setSectionData(prev => ({
        ...prev,
        cards: [
          { id: null, title: "Deluxe Double Room", image_url: null },
          { id: null, title: "Deluxe Twin Room", image_url: null },
          { id: null, title: "Executive Suite", image_url: null },
          { id: null, title: "Executive Room", image_url: null },
          { id: null, title: "One Bedroom Apartment", image_url: null },
          { id: null, title: "Two Bedroom Apartment", image_url: null },
          { id: null, title: "Three Bedroom Apartment", image_url: null },
        ]
      }));
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

  const updateCard = (index, updates) => {
    const newCards = [...sectionData.cards];
    newCards[index] = { ...newCards[index], ...updates };
    setSectionData(prev => ({ ...prev, cards: newCards }));
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const startEditing = (index, currentTitle) => {
    setEditingCardIndex(index);
    setEditingValue(currentTitle);
  };

  const saveTitle = (index) => {
    if (editingValue.trim() !== sectionData.cards[index].title) {
      updateCard(index, { title: editingValue.trim() });
    }
    setEditingCardIndex(null);
    setEditingValue("");
  };

  const handleHeroImageUpload = async (file) => {
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

    setUploadingHero(true);
    const previewUrl = URL.createObjectURL(file);
    updateField("hero_image_preview", previewUrl);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await apiRequest("/admin/home-section3/hero-image", "POST", formData, token, true);
      if (result.success) {
        updateField("hero_image", result.data.image_url);
        updateField("hero_image_preview", result.data.image_url);
      }
    } catch (err) {
      setError("Failed to upload hero image");
    } finally {
      setUploadingHero(false);
    }
  };

  const handleCardImageUpload = async (index, file) => {
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

    setUploadingCardIndex(index);
    const previewUrl = URL.createObjectURL(file);
    
    // Show preview immediately
    updateCard(index, { image_url_preview: previewUrl });

    const card = sectionData.cards[index];
    
    if (card.id) {
      const formData = new FormData();
      formData.append("image", file);
      
      try {
        const result = await apiRequest(`/admin/home-section3/card/${card.id}/image`, "POST", formData, token, true);
        if (result && result.success) {
          updateCard(index, { 
            image_url: result.data.image_url, 
            image_url_preview: result.data.image_url 
          });
        }
      } catch (err) {
        updateCard(index, { image_url_preview: null });
        setError("Failed to upload card image");
      }
    }
    
    setUploadingCardIndex(null);
  };

  const removeCardImage = (index) => {
    const card = sectionData.cards[index];
    
    // If card has an ID, mark its image for deletion on server
    if (card.id && card.image_url) {
      setImagesToDelete(prev => [...prev, card.id]);
    }
    
    updateCard(index, { 
      image_url: null, 
      image_url_preview: null 
    });
    setHasChanges(true);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      // First, save all text data and handle image deletions
      const data = {
        section_title: sectionData.section_title,
        section_subtitle: sectionData.section_subtitle,
        hero_title: sectionData.hero_title,
        hero_description: sectionData.hero_description,
        hero_image: sectionData.hero_image,
        cards: sectionData.cards.map(card => ({
          id: card.id,
          title: card.title,
        })),
        delete_images: imagesToDelete
      };

      const result = await apiRequest("/admin/home-section3", "POST", data, token);
      
      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setImagesToDelete([]);
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
    setEditingCardIndex(null);
    setImagesToDelete([]);
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
          <p className="mt-2 text-slate-500">Please login to manage section 3.</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Section 3 - Accommodations</h1>
            <p className="mt-1 text-sm text-slate-500">Manage the accommodations section with hero banner and room cards</p>
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

      {/* Section Header Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Section Header</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
            <input
              type="text"
              value={sectionData.section_title || ""}
              onChange={(e) => updateField("section_title", e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
              placeholder="Our Accommodations"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Section Subtitle</label>
            <input
              type="text"
              value={sectionData.section_subtitle || ""}
              onChange={(e) => updateField("section_subtitle", e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
              placeholder="Find Your Perfect Stay"
            />
          </div>
        </div>
      </div>

      {/* Hero Banner Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Hero Banner</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={sectionData.hero_title || ""}
                onChange={(e) => updateField("hero_title", e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                placeholder="MountainView"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hero Description</label>
              <textarea
                value={sectionData.hero_description || ""}
                onChange={(e) => updateField("hero_description", e.target.value)}
                rows={3}
                className="w-full border rounded-xl px-4 py-2.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none resize-y"
                placeholder="Experience comfort, elegance, and exceptional hospitality..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hero Background Image</label>
            <div className="border rounded-xl p-4 bg-gray-50">
              {sectionData.hero_image_preview ? (
                <img
                  src={sectionData.hero_image_preview}
                  alt="Hero preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-300" />
                </div>
              )}
              <label className="cursor-pointer block w-full mt-3">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 text-sm font-medium hover:from-emerald-600 hover:to-emerald-700">
                  {uploadingHero ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Upload size={14} />}
                  {uploadingHero ? "Uploading..." : "Upload Hero Image"}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleHeroImageUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Accommodation Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Accommodation Cards (7 Items)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sectionData.cards.map((card, index) => (
            <div key={card.id || index} className="border rounded-xl overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
              {/* Image Preview */}
              <div className="relative h-48 bg-gray-100">
                {(card.image_url_preview || card.image_url) ? (
                  <>
                    <img
                      src={card.image_url_preview || getImageUrl(card.image_url)}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeCardImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-300" />
                  </div>
                )}
                
                {/* Upload button overlay */}
                <label className="absolute bottom-2 right-2 cursor-pointer">
                  <div className="bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition">
                    <Upload size={12} />
                    {uploadingCardIndex === index ? "..." : "Upload"}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCardImageUpload(index, e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
              
              {/* Card Content */}
              <div className="p-4">
                {editingCardIndex === index ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => saveTitle(index)}
                      onKeyPress={(e) => e.key === 'Enter' && saveTitle(index)}
                      className="flex-1 font-semibold text-slate-900 border rounded-lg px-2 py-1 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <h3 className="font-semibold text-slate-900">{card.title}</h3>
                    <button
                      onClick={() => startEditing(index, card.title)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-500 transition"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Hover over the title to edit. Click "Upload" to add an image. Click the trash icon to delete an image.
        </p>
      </div>

      {/* Live Preview Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Live Preview</h2>
        
        {/* Section Header Preview */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{sectionData.section_title}</h2>
          <p className="text-slate-500 mt-2">{sectionData.section_subtitle}</p>
        </div>

        {/* Hero Banner Preview */}
        <div className="relative rounded-xl overflow-hidden mb-12 h-80">
          {(sectionData.hero_image_preview || sectionData.hero_image) ? (
            <>
              <img
                src={sectionData.hero_image_preview || getImageUrl(sectionData.hero_image)}
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-4xl font-bold text-white mb-4">{sectionData.hero_title}</h3>
                <p className="text-white/90 max-w-2xl">{sectionData.hero_description}</p>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-900 flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-4xl font-bold text-white mb-4">{sectionData.hero_title}</h3>
              <p className="text-white/80 max-w-2xl">{sectionData.hero_description}</p>
            </div>
          )}
        </div>

        {/* Cards Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sectionData.cards.map((card, index) => (
            <div key={card.id || index} className="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                {(card.image_url_preview || card.image_url) ? (
                  <img
                    src={card.image_url_preview || getImageUrl(card.image_url)}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4 text-center bg-white">
                <h4 className="font-semibold text-slate-900">{card.title}</h4>
                <button className="mt-3 inline-block text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Important</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Hover over the title to see the edit icon, click to edit</li>
              <li>• Click "Upload" on any card to add an image</li>
              <li>• Click the trash icon to delete an image, then click "Save Changes"</li>
              <li>• Hero image saves immediately when uploaded</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}