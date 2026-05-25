import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Trash2 } from "lucide-react";

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

export default function ConferenceStatsSection() {
  const [stats, setStats] = useState([
    { id: null, label: "Events Hosted", value: "200+" },
    { id: null, label: "Guests Served", value: "5000+" },
    { id: null, label: "Event Spaces", value: "3" },
    { id: null, label: "Support Team", value: "24/7" },
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
      fetchStats();
    } else {
      setError("Please login first");
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const result = await apiRequest("/conference-stats", "GET");
      if (result.success && result.data && result.data.length > 0) {
        setStats(result.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStat = (index, field, value) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
    setHasChanges(true);
    setSaved(false);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await apiRequest("/admin/conference-stats", "POST", { stats }, token);
      
      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchStats();
      }
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchStats();
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;
  }

  if (!token) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-2 text-slate-500">Please login to manage stats.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Statistics (4 Items)</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={stat.id || index} className="border rounded-lg p-4 bg-gray-50 text-center">
              <input
                type="text"
                value={stat.value}
                onChange={(e) => updateStat(index, "value", e.target.value)}
                className="w-full text-3xl font-bold text-slate-900 text-center border rounded-lg px-2 py-1 mb-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => updateStat(index, "label", e.target.value)}
                className="w-full text-sm text-slate-500 text-center border rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}