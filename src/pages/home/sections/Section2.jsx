import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");
const STORAGE_URL = (import.meta.env.VITE_STORAGE_URL || `${APP_URL}/storage`).replace(/\/$/, "");

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

export default function Section2() {
  const [mainTitle, setMainTitle] = useState("A New Vision of Luxury Hotel");
  const [cards, setCards] = useState([
    { id: null, title: "Friendly Service" },
    { id: null, title: "Get Breakfast" },
    { id: null, title: "Transfer Services" },
    { id: null, title: "Suits" },
    { id: null, title: "Cozy Rooms" },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const result = await apiRequest("/home-section2", "GET");
      console.log("Fetched data:", result);
      
      if (result.success && result.data) {
        setMainTitle(result.data.main_title || "A New Vision of Luxury Hotel");
        if (result.data.cards && result.data.cards.length > 0) {
          setCards(result.data.cards);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load section data");
    } finally {
      setLoading(false);
    }
  };

  const updateMainTitle = (value) => {
    setMainTitle(value);
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const updateCardTitle = (index, value) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], title: value };
    setCards(newCards);
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const data = {
        main_title: mainTitle,
        cards: cards.map(card => ({
          id: card.id,
          title: card.title,
        }))
      };

      const result = await apiRequest("/admin/home-section2", "POST", data, token);
      
      if (result.success) {
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
          <p className="mt-2 text-slate-500">Please login to manage section 2.</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Section 2 - Service Cards</h1>
            <p className="mt-1 text-sm text-slate-500">Edit the main title and card titles</p>
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

      {/* Main Title Editor */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Main Title</h2>
        <div className="max-w-2xl">
          <input
            type="text"
            value={mainTitle}
            onChange={(e) => updateMainTitle(e.target.value)}
            className="w-full text-2xl font-bold text-slate-900 border rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
            placeholder="Enter main title..."
          />
        </div>
      </div>

      {/* Cards Grid - Only Titles */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Service Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {cards.map((card, index) => (
            <div key={card.id || index} className="border rounded-xl p-4 bg-gray-50">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Card {index + 1} Title
              </label>
              <input
                type="text"
                value={card.title || ""}
                onChange={(e) => updateCardTitle(index, e.target.value)}
                className="w-full font-semibold text-slate-900 border rounded-lg px-3 py-2 text-base focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                placeholder="Enter card title..."
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Edit card titles. Click Save Changes to store in database.
        </p>
      </div>

      {/* Live Preview Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Live Preview</h2>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{mainTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {cards.map((card, index) => (
            <div key={card.id || index} className="text-center p-4">
              <h3 className="font-bold text-slate-900">{card.title || "Untitled"}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Edit the main title and card titles directly in the input fields</li>
              <li>• Each card has only a title - no descriptions</li>
              <li>• Click "Save Changes" to store everything in the database</li>
              <li>• Live preview updates as you type</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}