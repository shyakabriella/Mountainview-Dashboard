import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function Section5() {
  const [sectionTitle, setSectionTitle] = useState("What Our Guests Say");
  const [testimonials, setTestimonials] = useState([
    { id: null, quote: "A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.", name: "Nathan Smith", role: "GUESTS" },
    { id: null, quote: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove.", name: "Sarah Johnson", role: "GUESTS" },
    { id: null, quote: "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.", name: "Michael Brown", role: "GUESTS" }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

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
      const result = await apiRequest("/home-section5", "GET");
      console.log("Fetched section 5 data:", result);
      
      if (result.success && result.data) {
        setSectionTitle(result.data.section_title || "What Our Guests Say");
        if (result.data.testimonials && result.data.testimonials.length > 0) {
          setTestimonials(result.data.testimonials);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTestimonial = (index, field, value) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setTestimonials(newTestimonials);
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      { id: null, quote: "", name: "", role: "GUESTS" }
    ]);
    setHasChanges(true);
  };

  const removeTestimonial = (index) => {
    const newTestimonials = [...testimonials];
    newTestimonials.splice(index, 1);
    setTestimonials(newTestimonials);
    setHasChanges(true);
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const data = {
        section_title: sectionTitle,
        testimonials: testimonials.map((t, index) => ({
          id: t.id,
          quote: t.quote,
          name: t.name,
          role: t.role || "GUESTS",
          sort_order: index + 1
        }))
      };

      const result = await apiRequest("/admin/home-section5", "POST", data, token);
      
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

  const nextPreview = () => {
    if (previewIndex < testimonials.length - 1) {
      setPreviewIndex(previewIndex + 1);
    }
  };

  const prevPreview = () => {
    if (previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
    }
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
          <p className="mt-2 text-slate-500">Please login to manage section 5.</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Section 5 - Testimonials Slider</h1>
            <p className="mt-1 text-sm text-slate-500">Manage the testimonials slider with quotes and customer names</p>
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

      {/* Section Title */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Section Title</h2>
        <div>
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => {
              setSectionTitle(e.target.value);
              setHasChanges(true);
              setSaved(false);
            }}
            className="w-full max-w-2xl text-2xl font-bold text-slate-900 border rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
            placeholder="What Our Guests Say"
          />
        </div>
      </div>

      {/* Testimonials List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Testimonials</h2>
          <button
            onClick={addTestimonial}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600 transition"
          >
            <Plus size={16} />
            Add Testimonial
          </button>
        </div>

        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id || index} className="border rounded-xl p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-slate-700">Testimonial {index + 1}</h3>
                <button
                  onClick={() => removeTestimonial(index)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quote</label>
                  <textarea
                    value={testimonial.quote}
                    onChange={(e) => updateTestimonial(index, "quote", e.target.value)}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none resize-y"
                    placeholder="Enter testimonial quote..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                      placeholder="Customer name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role / Tag</label>
                    <input
                      type="text"
                      value={testimonial.role || ""}
                      onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                      placeholder="GUESTS"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Add, edit, or remove testimonials. All changes save when you click "Save Changes".
        </p>
      </div>

      {/* Live Preview - Slider */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Live Preview (Slider)</h2>
        
        {testimonials.length > 0 ? (
          <div className="relative">
            {/* Current Testimonial */}
            <div className="text-center py-8 px-4">
              <div className="max-w-2xl mx-auto">
                <p className="text-slate-600 text-lg italic mb-6">
                  "{testimonials[previewIndex]?.quote}"
                </p>
                <h4 className="font-bold text-slate-900 text-xl">
                  {testimonials[previewIndex]?.name}
                </h4>
                <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wider mt-1">
                  {testimonials[previewIndex]?.role || "GUESTS"}
                </p>
              </div>
            </div>
            
            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={prevPreview}
                  disabled={previewIndex === 0}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2 items-center">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        previewIndex === idx
                          ? "w-8 bg-emerald-500"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextPreview}
                  disabled={previewIndex === testimonials.length - 1}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            No testimonials added yet. Click "Add Testimonial" to create one.
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Add as many testimonials as you want - they will appear in a slider</li>
              <li>• Edit quotes, customer names, and roles for each testimonial</li>
              <li>• Use the preview slider to see how it will look on the website</li>
              <li>• Click "Save Changes" to store everything in the database</li>
              <li>• Delete testimonials by clicking the trash icon</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}