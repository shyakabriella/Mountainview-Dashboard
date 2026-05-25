import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Type } from "lucide-react";

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

export default function ServicesCtaSection() {
  const [data, setData] = useState({
    id: null,
    title: "Ready to Experience It?",
    description: "Book your stay today and let us take care of everything.",
    button_text: "Book Your Stay",
    button_link: "/booking"
  });
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
      const result = await apiRequest("/services-cta", "GET");
      if (result.success && result.data) {
        setData(result.data);
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

  const saveToBackend = async () => {
    setSaving(true);
    setError(null);

    try {
      let result;
      if (data.id) {
        result = await apiRequest(`/admin/services-cta/${data.id}`, "PUT", data, token);
      } else {
        result = await apiRequest("/admin/services-cta", "POST", data, token);
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
        <p className="mt-2 text-slate-500">Please login to manage CTA section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Call to Action Section</h2>
        <div className="flex gap-2">
          {saved && <span className="text-emerald-600 text-sm flex items-center gap-1"><Check size={14} /> Saved!</span>}
          <button onClick={handleReset} className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"><RotateCcw size={15} /> Reset</button>
          <button onClick={saveToBackend} disabled={!hasChanges || saving} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${hasChanges && !saving ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700" : "bg-gray-300 cursor-not-allowed"}`}>
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={15} />} Save Changes
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input 
            value={data.title} 
            onChange={(e) => updateField("title", e.target.value)} 
            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
            placeholder="Ready to Experience It?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            value={data.description} 
            onChange={(e) => updateField("description", e.target.value)} 
            rows={3} 
            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-y" 
            placeholder="Book your stay today and let us take care of everything."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input 
              value={data.button_text} 
              onChange={(e) => updateField("button_text", e.target.value)} 
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
              placeholder="Book Your Stay"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Button Link</label>
            <input 
              value={data.button_link} 
              onChange={(e) => updateField("button_link", e.target.value)} 
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
              placeholder="/booking"
            />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-gray-50 rounded-xl border p-8 text-center">
        <h3 className="text-2xl font-bold text-slate-900">{data.title}</h3>
        <p className="text-slate-500 mt-3 max-w-md mx-auto">{data.description}</p>
        <button className="mt-6 bg-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition">
          {data.button_text}
        </button>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Edit the title, description, and button text for the CTA section</li>
              <li>• The button link can be internal (/booking) or external (https://...)</li>
              <li>• Click "Save Changes" to store your changes in the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}