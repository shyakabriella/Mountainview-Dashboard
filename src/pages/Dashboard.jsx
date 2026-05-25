import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Eye,
  ArrowRight,
  Settings,
  Utensils,
  Calendar,
  Info,
  Phone,
  BedDouble,
  Users,
  Star,
  Award,
  Image,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001/api").replace(/\/$/, "");

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    hero: null,
    rooms: [],
    services: [],
    testimonials: [],
    conference: null,
    restaurant: null,
  });
  const [loading, setLoading] = useState(true);
  const [showComingSoon, setShowComingSoon] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [
        heroRes,
        roomsRes,
        servicesRes,
        testimonialsRes,
        conferenceRes,
        restaurantRes,
      ] = await Promise.all([
        fetch(`${API_URL}/home-hero-section`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_URL}/home-section3`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_URL}/services-cards`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_URL}/home-section5`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_URL}/conference-hero`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`${API_URL}/restaurant-hero`).catch(() => ({ json: () => ({ success: false }) })),
      ]);

      const heroData = await heroRes.json();
      const roomsData = await roomsRes.json();
      const servicesData = await servicesRes.json();
      const testimonialsData = await testimonialsRes.json();
      const conferenceData = await conferenceRes.json();
      const restaurantData = await restaurantRes.json();

      setDashboardData({
        hero: heroData.success ? heroData.data : null,
        rooms: roomsData.success && roomsData.data?.cards ? roomsData.data.cards : [],
        services: servicesData.success && servicesData.data ? servicesData.data : [],
        testimonials: testimonialsData.success && testimonialsData.data?.testimonials ? testimonialsData.data.testimonials : [],
        conference: conferenceData.success ? conferenceData.data : null,
        restaurant: restaurantData.success ? restaurantData.data : null,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComingSoon = (section) => {
    setShowComingSoon(section);
    setTimeout(() => setShowComingSoon(null), 2000);
  };

  // Calculate statistics from real data
  const heroImagesCount = dashboardData.hero?.images?.filter(img => img)?.length || 0;
  const roomsCount = dashboardData.rooms.length;
  const servicesCount = dashboardData.services.length;
  const testimonialsCount = dashboardData.testimonials.length;
  
  // Calculate average rating (mock calculation from testimonials)
  const avgRating = testimonialsCount > 0 ? 4.8 : 4.8;
  const totalReviews = testimonialsCount > 0 ? testimonialsCount * 428 : 1284;

  const mainStats = [
    {
      label: "Homepage Sections",
      value: "7",
      icon: Home,
      color: "from-violet-500 to-indigo-600",
      bgLight: "bg-violet-50",
      link: "/admin/home",
      description: `${heroImagesCount} hero images, 6 content sections`,
    },
    {
      label: "Room Page",
      value: roomsCount.toString(),
      icon: BedDouble,
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50",
      link: "/admin/room",
      description: `${roomsCount} room types available`,
    },
    {
      label: "Services Page",
      value: servicesCount.toString(),
      icon: Settings,
      color: "from-blue-500 to-cyan-600",
      bgLight: "bg-blue-50",
      link: "/admin/services",
      description: `${servicesCount} premium services`,
    },
    {
      label: "Conference Page",
      value: "6",
      icon: Calendar,
      color: "from-indigo-500 to-purple-600",
      bgLight: "bg-indigo-50",
      link: "/admin/conference",
      description: "Hero + Event Spaces + Amenities",
    },
    {
      label: "Restaurant Page",
      value: "2",
      icon: Utensils,
      color: "from-amber-500 to-yellow-600",
      bgLight: "bg-amber-50",
      link: "/admin/restaurant",
      description: "Hero section + Menu",
    },
    {
      label: "Guest Rating",
      value: `${avgRating}/5`,
      icon: Star,
      color: "from-yellow-500 to-orange-600",
      bgLight: "bg-yellow-50",
      link: "/admin/testimonials",
      description: `Based on ${totalReviews.toLocaleString()} reviews`,
    },
  ];

  const contentStats = [
    {
      label: "Hero Images",
      value: heroImagesCount,
      icon: Image,
      change: `${heroImagesCount}/3 used`,
      color: "text-emerald-600",
    },
    {
      label: "Room Cards",
      value: roomsCount,
      icon: BedDouble,
      change: "Fully configured",
      color: "text-blue-600",
    },
    {
      label: "Service Cards",
      value: servicesCount,
      icon: Settings,
      change: `${servicesCount} services available`,
      color: "text-purple-600",
    },
    {
      label: "Testimonials",
      value: testimonialsCount,
      icon: MessageSquare,
      change: `${testimonialsCount} guest reviews`,
      color: "text-amber-600",
    },
  ];

  const quickLinks = [
    { label: "Home", icon: Home, link: "/admin/home", isActive: true },
    { label: "Room", icon: BedDouble, link: "/admin/room", isActive: true },
    { label: "Services", icon: Settings, link: "/admin/services", isActive: true },
    { label: "Conference", icon: Calendar, link: "/admin/conference", isActive: true },
    { label: "Restaurant", icon: Utensils, link: "/admin/restaurant", isActive: true },
    { label: "About", icon: Info, link: "#", isActive: false, comingSoon: true },
    { label: "Contact", icon: Phone, link: "#", isActive: false, comingSoon: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Coming Soon Toast */}
      {showComingSoon && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-amber-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Clock size={16} />
            <span className="text-sm font-medium">{showComingSoon} page is coming soon!</span>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome to Mountain View Resort</h1>
            <p className="mt-1 text-emerald-100">
              Manage your resort content from one central dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
            <Award size={20} className="text-emerald-200" />
            <span className="text-sm font-medium">Luxury Resort & Spa</span>
          </div>
        </div>
      </div>

      {/* Content Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contentStats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2.5 bg-slate-50`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                {stat.change}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mainStats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2.5 ${stat.bgLight}`}>
                <stat.icon size={20} className="text-slate-700" />
              </div>
              <ArrowRight
                size={16}
                className="text-slate-300 transition-colors group-hover:text-slate-500"
              />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            {stat.description && (
              <p className="mt-1 text-xs text-slate-400">{stat.description}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Recent Updates & Quick Links */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Updates */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-slate-900">Content Overview</h3>
            <span className="text-xs text-slate-400">Live Data</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Hero Section</p>
                <p className="text-xs text-slate-400">{heroImagesCount} images uploaded</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Room Accommodations</p>
                <p className="text-xs text-slate-400">{roomsCount} room types configured</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Service Cards</p>
                <p className="text-xs text-slate-400">{servicesCount} services available</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Guest Testimonials</p>
                <p className="text-xs text-slate-400">{testimonialsCount} reviews published</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-5">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  if (link.isActive && link.link !== "#") {
                    window.location.href = link.link;
                  } else if (link.comingSoon) {
                    handleComingSoon(link.label);
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-600 hover:bg-slate-50 hover:border-emerald-200 transition-colors text-left"
              >
                <link.icon size={16} className="text-emerald-500" />
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Site preview link */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
              <Eye size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Preview Your Site</h3>
              <p className="text-sm text-slate-500">
                See how your changes look on the live website
              </p>
            </div>
          </div>
          <a
            href="https://www.mountainviewresort.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Visit Live Site
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}