import { useState, useEffect } from "react";
import { Save, RotateCcw, Check, AlertCircle, Plus, Trash2, Edit2, X } from "lucide-react";

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

export default function Section7() {
  const [sectionTitle, setSectionTitle] = useState("Menu");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingItem, setEditingItem] = useState({ categoryIndex: null, itemIndex: null });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

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
      const result = await apiRequest("/home-section7", "GET");
      console.log("Fetched section 7 data:", result);
      
      if (result.success && result.data) {
        setSectionTitle(result.data.section_title || "Menu");
        setCategories(result.data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryName = (index, name) => {
    const newCategories = [...categories];
    newCategories[index].name = name;
    setCategories(newCategories);
    setHasChanges(true);
    setSaved(false);
  };

  const updateItem = (categoryIndex, itemIndex, field, value) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items[itemIndex][field] = value;
    setCategories(newCategories);
    setHasChanges(true);
    setSaved(false);
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([
        ...categories,
        { id: null, name: newCategoryName.trim(), items: [] }
      ]);
      setNewCategoryName("");
      setShowAddCategory(false);
      setHasChanges(true);
    }
  };

  const addItem = (categoryIndex) => {
    const newCategories = [...categories];
    newCategories[categoryIndex].items.push({
      id: null,
      name: "New Item",
      description: "Item description"
    });
    setCategories(newCategories);
    setHasChanges(true);
  };

  const deleteCategory = async (categoryIndex) => {
    const category = categories[categoryIndex];
    
    // If category has an ID, delete from backend
    if (category.id) {
      if (!confirm(`Delete "${category.name}" and all its items? This cannot be undone.`)) {
        return;
      }
      
      setDeleting(true);
      try {
        const result = await apiRequest(`/admin/home-section7/category/${category.id}`, "DELETE", null, token);
        if (result.success) {
          // Remove from local state
          const newCategories = [...categories];
          newCategories.splice(categoryIndex, 1);
          setCategories(newCategories);
          setHasChanges(true);
          
          // Adjust active category index
          if (activeCategory >= newCategories.length) {
            setActiveCategory(Math.max(0, newCategories.length - 1));
          }
          
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } else {
          setError(result.message || "Failed to delete category");
        }
      } catch (err) {
        setError("Failed to delete category: " + err.message);
      } finally {
        setDeleting(false);
      }
    } else {
      // New category not saved yet - just remove from local state
      if (confirm(`Delete "${category.name}"?`)) {
        const newCategories = [...categories];
        newCategories.splice(categoryIndex, 1);
        setCategories(newCategories);
        setHasChanges(true);
        if (activeCategory >= newCategories.length) {
          setActiveCategory(Math.max(0, newCategories.length - 1));
        }
      }
    }
  };

  const deleteItem = async (categoryIndex, itemIndex) => {
    const item = categories[categoryIndex].items[itemIndex];
    
    // If item has an ID, delete from backend
    if (item.id) {
      if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) {
        return;
      }
      
      setDeleting(true);
      try {
        const result = await apiRequest(`/admin/home-section7/item/${item.id}`, "DELETE", null, token);
        if (result.success) {
          // Remove from local state
          const newCategories = [...categories];
          newCategories[categoryIndex].items.splice(itemIndex, 1);
          setCategories(newCategories);
          setHasChanges(true);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } else {
          setError(result.message || "Failed to delete item");
        }
      } catch (err) {
        setError("Failed to delete item: " + err.message);
      } finally {
        setDeleting(false);
      }
    } else {
      // New item not saved yet - just remove from local state
      if (confirm(`Delete "${item.name}"?`)) {
        const newCategories = [...categories];
        newCategories[categoryIndex].items.splice(itemIndex, 1);
        setCategories(newCategories);
        setHasChanges(true);
      }
    }
  };

  const saveAll = async () => {
    setSaving(true);
    setError(null);

    try {
      const data = {
        section_title: sectionTitle,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          items: cat.items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || ""
          }))
        }))
      };

      const result = await apiRequest("/admin/home-section7", "POST", data, token);
      
      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchData(); // Refresh to get proper IDs
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
    setEditingCategory(null);
    setEditingItem({ categoryIndex: null, itemIndex: null });
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
          <p className="mt-2 text-slate-500">Please login to manage menu section.</p>
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
            <h1 className="text-2xl font-bold text-slate-900">Section 7 - Menu</h1>
            <p className="mt-1 text-sm text-slate-500">Manage the restaurant menu with categories and items</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Check size={16} />
                {saved === "deleted" ? "Deleted successfully" : "Saved successfully"}
              </span>
            )}
            <button
              onClick={handleReset}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>
            <button
              onClick={saveAll}
              disabled={!hasChanges || saving || deleting}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all ${
                hasChanges && !saving && !deleting
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
            className="w-full max-w-md text-2xl font-bold text-slate-900 border rounded-xl px-4 py-3 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
            placeholder="Menu"
          />
        </div>
      </div>

      {/* Categories and Items */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Menu Categories</h2>
          {!showAddCategory ? (
            <button
              onClick={() => setShowAddCategory(true)}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
            >
              <Plus size={16} />
              Add Category
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="border rounded-lg px-3 py-2 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                autoFocus
              />
              <button
                onClick={addCategory}
                className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-600"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddCategory(false)}
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Category Buttons */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {categories.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeCategory === idx
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Active Category Items */}
        {categories.length > 0 && categories[activeCategory] && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {editingCategory === activeCategory ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={categories[activeCategory].name}
                      onChange={(e) => updateCategoryName(activeCategory, e.target.value)}
                      className="text-xl font-bold text-slate-900 border rounded-lg px-3 py-1 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-900">{categories[activeCategory].name}</h3>
                    <button
                      onClick={() => setEditingCategory(activeCategory)}
                      className="text-slate-400 hover:text-emerald-500 transition"
                      disabled={deleting}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteCategory(activeCategory)}
                      className="text-red-500 hover:text-red-700 transition"
                      disabled={deleting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => addItem(activeCategory)}
                disabled={deleting}
                className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {categories[activeCategory].items.map((item, itemIdx) => (
                <div key={item.id || itemIdx} className="border rounded-lg p-4 bg-gray-50">
                  {editingItem.categoryIndex === activeCategory && editingItem.itemIndex === itemIdx ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(activeCategory, itemIdx, "name", e.target.value)}
                        className="w-full font-bold text-slate-900 border rounded-lg px-3 py-2 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none"
                        placeholder="Item name"
                        autoFocus
                      />
                      <textarea
                        value={item.description || ""}
                        onChange={(e) => updateItem(activeCategory, itemIdx, "description", e.target.value)}
                        rows={2}
                        className="w-full text-slate-600 border rounded-lg px-3 py-2 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 outline-none resize-y"
                        placeholder="Item description"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingItem({ categoryIndex: null, itemIndex: null })}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem({ categoryIndex: null, itemIndex: null })}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{item.name}</h4>
                        <p className="text-slate-500 text-sm mt-1">{item.description || "No description"}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingItem({ categoryIndex: activeCategory, itemIndex: itemIdx })}
                          className="text-slate-400 hover:text-emerald-500 transition"
                          disabled={deleting}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteItem(activeCategory, itemIdx)}
                          className="text-red-500 hover:text-red-700 transition"
                          disabled={deleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {categories[activeCategory].items.length === 0 && (
                <p className="text-center text-slate-400 py-8">No items yet. Click "Add Item" to create one.</p>
              )}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No categories yet. Click "Add Category" to create one.
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">Live Preview</h2>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{sectionTitle}</h2>
        </div>

        {categories.length > 0 && (
          <>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category, idx) => (
                <button
                  key={idx}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                    activeCategory === idx
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-slate-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="max-w-3xl mx-auto">
              {categories[activeCategory] && categories[activeCategory].items.map((item, idx) => (
                <div key={idx} className="border-b border-gray-100 py-4">
                  <h4 className="font-semibold text-slate-900">{item.name}</h4>
                  <p className="text-slate-500 text-sm mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">Tips</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Add categories first, then add menu items to each category</li>
              <li>• Click Save Changes to save everything to the database</li>
              <li>• After saving, you can delete categories and items permanently</li>
              <li>• Categories and items with IDs (saved) will be deleted from the server</li>
              <li>• New items (without IDs) will be removed from local state only</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}