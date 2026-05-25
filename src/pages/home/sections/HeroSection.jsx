import { useState, useEffect } from "react";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api").replace(/\/$/, "");
const APP_URL = API_URL.replace(/\/api$/, "");
const STORAGE_URL = (import.meta.env.VITE_STORAGE_URL || `${APP_URL}/storage`).replace(/\/$/, "");

const getErrorMessage = (data, fallback = "Something went wrong") => {
  if (!data) return fallback;
  if (data.errors) return Object.values(data.errors).flat().join(", ");
  return data.message || data.error || fallback;
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
  if (method === "GET" && response.status === 404) return { success: false, data: null };
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return await response.json();
};

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/storage/")) return `${APP_URL}${path}`;
  if (path.startsWith("storage/")) return `${APP_URL}/${path}`;
  return `${STORAGE_URL}/${path}`;
};

export default function HeroSectionManager() {
  const [sectionData, setSectionData] = useState({
    id: null,
    title: "Welcome to Luxury & Comfort",
    subtitle: "Discover Unforgettable Stays",
    description: "From elegant accommodations and exceptional dining to seamless services and curated experiences, every detail is thoughtfully designed to deliver comfort, style, and unforgettable moments.",
    images: [null, null, null],
    imagePreviews: [null, null, null],
    imageFiles: [null, null, null],
    deletedImages: [false, false, false], // Track which images are marked for deletion
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [currentPreviewSlide, setCurrentPreviewSlide] = useState(0);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || localStorage.getItem("auth_token") || localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      fetchHeroData();
    } else {
      setError("Please login first");
      setLoading(false);
    }
  }, []);

  const fetchHeroData = async () => {
    try {
      console.log("Fetching hero data from backend...");
      const result = await apiRequest("/home-hero-section", "GET");
      console.log("Fetched hero data:", result);
      
      if (result.success && result.data) {
        let imagePreviews = [null, null, null];
        let images = [null, null, null];
        
        if (result.data.images && Array.isArray(result.data.images)) {
          result.data.images.forEach((img, index) => {
            if (index < 3 && img) {
              imagePreviews[index] = img;
              images[index] = img;
              console.log(`Image ${index}: ${img}`);
            }
          });
        }
        
        setSectionData({
          id: result.data.id || null,
          title: result.data.title || "Welcome to Luxury & Comfort",
          subtitle: result.data.subtitle || "Discover Unforgettable Stays",
          description: result.data.description || "",
          images: images,
          imagePreviews: imagePreviews,
          imageFiles: [null, null, null],
          deletedImages: [false, false, false],
        });
        setHasChanges(false);
      } else {
        console.log("No hero data found in backend, using defaults");
      }
    } catch (err) {
      console.error("Error fetching hero data:", err);
      if (!err.message?.includes("404")) {
        setError(err.message || "Failed to fetch hero data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSectionData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaved(false);
    setError(null);
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image (JPEG, PNG, WebP, GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploadingIndex(index);
    
    const previewUrl = URL.createObjectURL(file);
    
    const newPreviews = [...sectionData.imagePreviews];
    const newFiles = [...sectionData.imageFiles];
    const newDeleted = [...sectionData.deletedImages];
    
    newPreviews[index] = previewUrl;
    newFiles[index] = file;
    newDeleted[index] = false; // Remove deletion mark if any
    
    setSectionData(prev => ({
      ...prev,
      imagePreviews: newPreviews,
      imageFiles: newFiles,
      deletedImages: newDeleted,
    }));
    setHasChanges(true);
    setSaved(false);
    setError(null);
    setUploadingIndex(null);
  };

  const removeImage = (index) => {
    const newDeleted = [...sectionData.deletedImages];
    const newPreviews = [...sectionData.imagePreviews];
    const newImages = [...sectionData.images];
    const newFiles = [...sectionData.imageFiles];
    
    // Mark for deletion instead of just removing from state
    if (sectionData.images[index]) {
      newDeleted[index] = true;
    }
    
    newPreviews[index] = null;
    newImages[index] = null;
    newFiles[index] = null;
    
    setSectionData(prev => ({
      ...prev,
      images: newImages,
      imagePreviews: newPreviews,
      imageFiles: newFiles,
      deletedImages: newDeleted,
    }));
    setHasChanges(true);
    setSaved(false);
    
    const validPreviews = newPreviews.filter(img => img !== null);
    if (currentPreviewSlide >= validPreviews.length && validPreviews.length > 0) {
      setCurrentPreviewSlide(validPreviews.length - 1);
    } else if (validPreviews.length === 0) {
      setCurrentPreviewSlide(0);
    }
  };

  const saveToBackend = async () => {
    if (!sectionData.title) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", sectionData.title);
      formData.append("subtitle", sectionData.subtitle || "");
      formData.append("description", sectionData.description || "");
      
      // Track which images to delete
      const imagesToDelete = [];
      sectionData.deletedImages.forEach((isDeleted, index) => {
        if (isDeleted) {
          imagesToDelete.push(index);
        }
      });
      formData.append("delete_images", JSON.stringify(imagesToDelete));
      
      // Add new images
      sectionData.imageFiles.forEach((file, index) => {
        if (file) {
          formData.append(`images[${index}]`, file);
        }
      });

      // Send existing images that weren't changed or deleted
      const existingImages = [];
      sectionData.images.forEach((img, index) => {
        if (img && !img.startsWith('blob:') && !sectionData.imageFiles[index] && !sectionData.deletedImages[index]) {
          existingImages[index] = img;
        }
      });
      
      if (existingImages.length > 0) {
        formData.append("existing_images", JSON.stringify(existingImages));
      }

      console.log("Saving to backend...");
      console.log("Images to delete:", imagesToDelete);
      console.log("Existing images:", existingImages);

      let result;
      if (sectionData.id) {
        formData.append("_method", "PUT");
        result = await apiRequest(`/admin/home-hero-section/${sectionData.id}`, "POST", formData, token, true);
      } else {
        result = await apiRequest("/admin/home-hero-section", "POST", formData, token, true);
      }

      console.log("Save response:", result);

      if (result.success) {
        setHasChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        await fetchHeroData(); // Refresh data from backend
      } else {
        setError(getErrorMessage(result, "Error saving hero section"));
      }
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save hero section. Check if backend is running.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchHeroData();
    setError(null);
  };

  const nextSlide = () => {
    const validPreviews = sectionData.imagePreviews.filter(img => img !== null);
    if (currentPreviewSlide < validPreviews.length - 1) {
      setCurrentPreviewSlide(currentPreviewSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentPreviewSlide > 0) {
      setCurrentPreviewSlide(currentPreviewSlide - 1);
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
          <p className="mt-2 text-slate-500">Please login to manage hero content.</p>
        </div>
      </div>
    );
  }

  const validPreviews = sectionData.imagePreviews.filter(img => img !== null);
  const currentImage = validPreviews[currentPreviewSlide];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Home Hero Section</h2>
          <p className="text-sm text-gray-500">Edit the homepage hero banner with 3 sliding images</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={handleReset} 
            className="px-3 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button 
            onClick={saveToBackend} 
            disabled={!hasChanges || saving} 
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              hasChanges && !saving
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700" 
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={15} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <Check size={16} /> Home hero section saved to database successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Form */}
        <div className="space-y-4 bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              value={sectionData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              placeholder="Enter hero title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              value={sectionData.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              placeholder="Enter hero subtitle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={sectionData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-y"
              placeholder="Enter hero description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Slider Images (Upload up to 3 images)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs font-medium text-gray-600 mb-2">Image {index + 1}</p>
                  
                  {sectionData.imagePreviews[index] ? (
                    <div className="relative group">
                      <img 
                        src={sectionData.imagePreviews[index]} 
                        className="w-full h-32 object-cover rounded-lg border shadow-sm" 
                        alt={`Slide ${index + 1}`}
                        onError={(e) => {
                          console.error(`Failed to load image ${index}:`, sectionData.imagePreviews[index]);
                          e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
                        }}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                      {sectionData.deletedImages[index] && (
                        <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                          Will be deleted
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                  )}
                  
                  <label className={`cursor-pointer mt-2 w-full text-center block ${
                    sectionData.imagePreviews[index] 
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                  } px-3 py-2 rounded-lg transition-colors text-sm font-medium`}>
                    {uploadingIndex === index ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Uploading...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Upload size={14} />
                        {sectionData.imagePreviews[index] ? "Change Image" : "Upload Image"}
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/jpg,image/webp,image/gif" 
                      onChange={(e) => handleImageUpload(index, e.target.files[0])} 
                      className="hidden" 
                    />
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Upload up to 3 images for the hero slider. Click the trash icon to mark image for deletion, then Save Changes.
            </p>
          </div>
        </div>

        {/* Right - Live Preview with Slider */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Live Preview (Slider)</h3>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="relative h-80 overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
              {currentImage ? (
                <>
                  <img 
                    src={currentImage} 
                    className="w-full h-full object-cover" 
                    alt={`Slide ${currentPreviewSlide + 1}`}
                    onError={(e) => {
                      console.error("Failed to load preview image:", currentImage);
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900" />
              )}
              
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="max-w-2xl px-6">
                  {sectionData.subtitle && (
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                      {sectionData.subtitle}
                    </p>
                  )}
                  {sectionData.title && (
                    <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                      {sectionData.title}
                    </h1>
                  )}
                  {sectionData.description && (
                    <p className="mb-6 text-sm text-white/90 md:text-base">
                      {sectionData.description}
                    </p>
                  )}
                  <button className="inline-block rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600">
                    Explore More
                  </button>
                </div>
              </div>
              
              {validPreviews.length > 1 && currentImage && (
                <>
                  <button
                    onClick={prevSlide}
                    disabled={currentPreviewSlide === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentPreviewSlide === validPreviews.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed z-10"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              
              {validPreviews.length > 1 && currentImage && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {validPreviews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPreviewSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        currentPreviewSlide === idx
                          ? "w-8 bg-emerald-500"
                          : "w-2 bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-center">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  sectionData.imagePreviews[index] 
                    ? sectionData.deletedImages[index] 
                      ? 'bg-red-500' 
                      : 'bg-emerald-500'
                    : 'bg-gray-300'
                }`}
                title={`Image ${index + 1}: ${sectionData.deletedImages[index] ? 'Will be deleted' : (sectionData.imagePreviews[index] ? 'Uploaded' : 'Not uploaded')}`}
              />
            ))}
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            {validPreviews.length} of 3 images uploaded
            {sectionData.deletedImages.some(d => d) && <span className="text-red-500 ml-2"> (Some marked for deletion)</span>}
          </p>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">How to delete images:</p>
                <ul className="space-y-1">
                  <li>• Click the trash icon on any image to mark it for deletion</li>
                  <li>• The image will show "Will be deleted" badge</li>
                  <li>• Click "Save Changes" to permanently delete the image</li>
                  <li>• After saving, refresh the page to confirm deletion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}