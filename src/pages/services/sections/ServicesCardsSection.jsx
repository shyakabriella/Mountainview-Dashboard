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

export default function ServicesCardsSection() {
  const [cards, setCards] = useState([
    { id: null, title: "Luxury Accommodation", description: "Choose from our range of elegantly furnished rooms and suites, each designed to provide maximum comfort with stunning views.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Fine Dining Restaurant", description: "Savour expertly crafted cuisine featuring both local Rwandan flavours and international dishes.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Swimming Pool", description: "Relax in our outdoor pool surrounded by greenery — perfect for refreshing moments.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Events & Conferences", description: "Host meetings, weddings, or celebrations in fully equipped elegant spaces.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Bar & Lounge", description: "Enjoy premium drinks in a relaxing and stylish lounge environment.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Airport Transfers", description: "Travel stress-free with our private and comfortable airport transfer services.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Wellness & Leisure", description: "Relax with massages and wellness services designed to refresh your body and mind.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "Breakfast & Room Service", description: "Enjoy delicious breakfast or convenient in-room dining anytime.", image_url: null, image_preview: null, image_file: null },
    { id: null, title: "High-Speed Wi-Fi", description: "Stay connected with fast and reliable internet throughout your stay.", image_url: null, image_preview: null, image_file: null },
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
      const result = await apiRequest("/services-cards", "GET");
      if (result.success && result.data && result.data.length > 0) {
        setCards(result.data.map(card => ({
          ...card,
          image_preview: card.image_url ? getImageUrl(card.image_url) : null,
          image_file: null,
        })));
      }
    } catch (err) {
      console.error("Error fetching cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateCard = (index, updates) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], ...updates };
    setCards(newCards);
    setHasChanges(true);
    setSaved(false);
  };

  const startEditing = (index, field, value) => {
    setEditingIndex(index);
    setEditField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (editValue.trim() !== cards[editingIndex][editField]) {
      updateCard(editingIndex, { [editField]: editValue.trim() });
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
    updateCard(index, { image_preview: previewUrl, image_file: file });

    const card = cards[index];
    if (card.id) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const result = await apiRequest(`/admin/services-cards/${card.id}/upload`, "POST", formData, token, true);
        if (result.success) {
          updateCard(index, { image_url: result.data.image_url, image_preview: result.data.image_url, image_file: null });
        }
      } catch (err) {
        setError("Failed to upload image");
      }
    }
    setUploadingIndex(null);
  };

  const removeImage = (index) => {
    const card = cards[index];
    if (card.id && card.image_url) {
      setDeletedImages(prev => [...prev, card.id]);
    }
    updateCard(index, { image_url: null, image_preview: null, image_file: null });
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      if (deletedImages.length > 0) {
        for (const id of deletedImages) {
          await apiRequest(`/admin/services-cards/${id}`, "DELETE", null, token);
        }
      }

      const cardsData = cards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
      }));

      const result = await apiRequest("/admin/services-cards", "POST", { cards: cardsData }, token);
      
      if (result.success) {
        const updatedCards = cards.map((card, i) => ({
          ...card,
          id: result.data[i]?.id || card.id,
        }));
        setCards(updatedCards);

        for (let i = 0; i < updatedCards.length; i++) {
          if (updatedCards[i].image_file && updatedCards[i].id) {
            const formData = new FormData();
            formData.append("image", updatedCards[i].image_file);
            await apiRequest(`/admin/services-cards/${updatedCards[i].id}/upload`, "POST", formData, token, true);
          }
        }

        setDeletedImages([]);
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchCards();
      }
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchCards();
    setDeletedImages([]);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-slate-500">Please login to manage services cards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Services Cards (9 Items)</h2>
        <div className="flex gap-2">
          {saved && <span className="text-emerald-600 text-sm">Saved!</span>}
          <button onClick={handleReset} className="px-3 py-2 border rounded-lg flex items-center gap-2"><RotateCcw size={15} /> Reset</button>
          <button onClick={saveAll} disabled={!hasChanges || saving} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${hasChanges && !saving ? "bg-emerald-500 text-white" : "bg-gray-300"}`}>
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div key={card.id || index} className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="relative h-48 bg-gray-100">
              {card.image_preview ? (
                <>
                  <img src={card.image_preview} className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-gray-300" /></div>
              )}
              <label className="absolute bottom-2 right-2 cursor-pointer bg-black/60 text-white px-3 py-1 rounded-lg text-xs">
                {uploadingIndex === index ? "..." : "Upload"}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files[0])} className="hidden" />
              </label>
            </div>
            <div className="p-4">
              {editingIndex === index && editField === "title" ? (
                <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} className="w-full font-bold border rounded px-2 py-1 mb-2" autoFocus />
              ) : (
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900">{card.title}</h3>
                  <button onClick={() => startEditing(index, "title", card.title)} className="text-slate-400 hover:text-emerald-500"><Edit2 size={14} /></button>
                </div>
              )}
              {editingIndex === index && editField === "description" ? (
                <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} rows={3} className="w-full text-sm border rounded px-2 py-1 mt-2" autoFocus />
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-slate-500 line-clamp-3">{card.description}</p>
                  <button onClick={() => startEditing(index, "description", card.description)} className="text-xs text-emerald-500 mt-1 hover:text-emerald-600">Edit description</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}