import { useEffect, useState } from "react";
import {
  Check,
  AlertCircle,
  ChevronRight,
  X,
  Sparkles,
  Star,
  Coffee,
  Calendar,
  Mountain,
  TreePine,
  Waves,
  Heart,
} from "lucide-react";
import HeroSection from "./sections/HeroSection";
import Section1 from "./sections/Section1";
import Section2 from "./sections/Section2";
import Section3 from "./sections/Section3";
import Section4 from "./sections/Section4";
import Section5 from "./sections/Section5";
import Section6 from "./sections/Section6";
import Section7 from "./sections/Section7";

const sections = [
  { id: "hero", label: "Hero Section", icon: Sparkles, description: "Main hero banner with background image", badge: "Featured", component: HeroSection },
  { id: "section1", label: "Section 1", icon: Mountain, description: "First content section", badge: "1", component: Section1 },
  { id: "section2", label: "Section 2", icon: TreePine, description: "Second content section", badge: "2", component: Section2 },
  { id: "section3", label: "Section 3", icon: Waves, description: "Third content section", badge: "3", component: Section3 },
  { id: "section4", label: "Section 4", icon: Coffee, description: "Fourth content section", badge: "4", component: Section4 },
  { id: "section5", label: "Section 5", icon: Calendar, description: "Fifth content section", badge: "5", component: Section5 },
  { id: "section6", label: "Section 6", icon: Star, description: "Sixth content section", badge: "6", component: Section6 },
  { id: "section7", label: "Section 7", icon: Heart, description: "Seventh content section", badge: "7", component: Section7 },
];

// Default content for each section
const defaultContent = {
  hero: {
    title: "Welcome to Mountain View Resort",
    subtitle: "Experience Luxury in Nature",
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
    buttonText: "Explore Our Resort",
    buttonLink: "/rooms",
  },
  section1: {
    title: "Luxurious Accommodations",
    description: "Experience the finest rooms with breathtaking mountain views. Each room is designed for comfort and elegance.",
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
    buttonText: "View Rooms",
    buttonLink: "/rooms",
    isReversed: false,
  },
  section2: {
    title: "World-Class Dining",
    description: "Savor exquisite cuisine prepared by our award-winning chefs. From local flavors to international delights.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    buttonText: "Explore Dining",
    buttonLink: "/restaurant",
    isReversed: true,
  },
  section3: {
    title: "Conference & Events",
    description: "State-of-the-art conference facilities perfect for business meetings, weddings, and special occasions.",
    imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800",
    buttonText: "Plan Your Event",
    buttonLink: "/conference",
    isReversed: false,
  },
  section4: {
    title: "Wellness & Spa",
    description: "Rejuvenate your mind and body at our full-service spa. Enjoy massages, facials, and wellness treatments.",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
    buttonText: "View Spa Services",
    buttonLink: "/services",
    isReversed: true,
  },
  section5: {
    title: "Outdoor Activities",
    description: "Explore nature with our guided hikes, mountain biking, and outdoor adventures for all skill levels.",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    buttonText: "See Activities",
    buttonLink: "/services",
    isReversed: false,
  },
  section6: {
    title: "Plan Your Stay",
    description: "Book your mountain getaway today. Special packages and seasonal offers available.",
    imageUrl: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800",
    buttonText: "Book Now",
    buttonLink: "/booking",
    isReversed: true,
  },
  section7: {
    title: "Special Offers",
    description: "Check out our seasonal packages and exclusive deals for an unforgettable mountain experience.",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    buttonText: "View Offers",
    buttonLink: "/offers",
    isReversed: false,
  },
};

export default function HomepageManager() {
  const [content, setContent] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem("mountain_view_homepage");
    if (savedContent) {
      setContent(JSON.parse(savedContent));
    } else {
      setContent(defaultContent);
    }
  }, []);

  const saveToLocalStorage = (newContent) => {
    localStorage.setItem("mountain_view_homepage", JSON.stringify(newContent));
    setContent(newContent);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveSection = (sectionId, updatedData) => {
    const updatedContent = {
      ...content,
      [sectionId]: updatedData,
    };
    saveToLocalStorage(updatedContent);
  };

  const openSection = (sectionId) => {
    setSelectedSection(sectionId);
  };

  const closeSection = () => {
    setSelectedSection(null);
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // Edit Mode - Show editor for selected section
  if (selectedSection) {
    const section = sections.find(s => s.id === selectedSection);
    const SectionComponent = section.component;
    const sectionData = content[selectedSection];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={closeSection}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Edit {section.label}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {section.description}
              </p>
            </div>
          </div>
        </div>

        <SectionComponent
          data={sectionData}
          onSave={(updatedData) => handleSaveSection(selectedSection, updatedData)}
        />
      </div>
    );
  }

  // Card View - Show all sections as cards
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Homepage Sections</h1>
          <p className="mt-1 text-sm text-slate-500">
            Click on any section card to edit its content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((section) => {
          const Icon = section.icon;
          
          return (
            <button
              key={section.id}
              onClick={() => openSection(section.id)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                  <Icon size={22} />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {section.badge}
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-slate-900">
                {section.label}
              </h3>

              <p className="mt-2 min-h-[38px] text-sm leading-6 text-slate-500">
                {section.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 truncate">
                  {content[section.id]?.title ? (
                    <>Title: {content[section.id].title}</>
                  ) : (
                    <span className="italic">No content yet</span>
                  )}
                </p>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-500">
                Manage Section
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-800">How it works</p>
            <ul className="mt-1 space-y-1 text-xs text-blue-600">
              <li>• Click on any section card to edit its content</li>
              <li>• Each section has its own editor with specific fields</li>
              <li>• Changes are saved automatically to your browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}