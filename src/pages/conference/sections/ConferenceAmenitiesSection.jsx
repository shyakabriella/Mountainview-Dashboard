import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Trash2, Plus } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api").replace(/\/$/, "");

const apiRequest = async (url, method = "GET", body = null, token = null) => {
  const options = { method, headers: { Accept: "application/json" } };
  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${API_URL}${url}`, options);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
};

export default function ConferenceAmenitiesSection() {
  const [amenities, setAmenities] = useState([
    { id: null, title: "High-Speed Wi-Fi" },
    { id: null, title: "Projectors & Screens" },
    { id: null, title: "Sound System" },
    { id: null, title: "Air Conditioning" },
    { id: null, title: "Catering Services" },
    { id: null, title: "Event Planning Support" },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [newAmenity, setNewAmenity] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchAmenities();
    } else {
      setError("Please login first");
      setLoading(false);
    }
  }, []);

  const fetchAmenities = async () => {
    try {
      const result = await apiRequest("/conference-amenities", "GET");
      if (result.success && result.data && result.data.length > 0) {
        setAmenities(result.data);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateAmenity = (index, value) => {
    const newAmenities = [...amenities];
    newAmenities[index].title = value;
    setAmenities(newAmenities);
    setHasChanges(true);
    setSaved(false);
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, { id: null, title: newAmenity.trim() }]);
      setNewAmenity("");
      setHasChanges(true);
    }
  };

  const removeAmenity = (index) => {
    const newAmenities = [...amenities];
    newAmenities.splice(index, 1);
    setAmenities(newAmenities);
    setHasChanges(true);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await apiRequest("/admin/conference-amenities", "POST", { amenities }, token);
      
      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchAmenities();
      }
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchAmenities();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-slate-500">Please login to manage amenities.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Amenities</h2>
        <div className="flex gap-2">
          {saved && <span className="text-emerald-600 text-sm flex items-center gap-1"><Check size={14} /> Saved!</span>}
          <button onClick={handleReset} className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"><RotateCcw size={15} /> Reset</button>
          <button onClick={saveAll} disabled={!hasChanges || saving} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${hasChanges && !saving ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" : "bg-gray-300 cursor-not-allowed"}`}>
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white" /> : <Save size={15} />} Save
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {amenities.map((amenity, index) => (
            <div key={amenity.id || index} className="flex items-center gap-2 border rounded-lg p-3 bg-gray-50">
              <input
                type="text"
                value={amenity.title}
                onChange={(e) => updateAmenity(index, e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button onClick={() => removeAmenity(index)} className="text-red-500 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
            placeholder="Add new amenity..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button onClick={addAmenity} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600">
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}