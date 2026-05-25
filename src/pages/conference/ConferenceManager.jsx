import { useState } from "react";
import { 
  Image, Sparkles, LayoutGrid, Wifi, BarChart3, 
  Calendar, ChevronRight, X 
} from "lucide-react";
import ConferenceHeroSection from "./sections/ConferenceHeroSection";
import ConferenceWelcomeSection from "./sections/ConferenceWelcomeSection";
import ConferenceEventSpacesSection from "./sections/ConferenceEventSpacesSection";
import ConferenceAmenitiesSection from "./sections/ConferenceAmenitiesSection";
import ConferenceStatsSection from "./sections/ConferenceStatsSection";
import ConferenceCtaSection from "./sections/ConferenceCtaSection";

const sections = [
  { 
    id: "hero", 
    label: "Hero Section", 
    icon: Image, 
    description: "Hero banner with background image, title, subtitle and description", 
    badge: "1", 
    component: ConferenceHeroSection 
  },
  { 
    id: "welcome", 
    label: "Welcome Section", 
    icon: Sparkles, 
    description: "Welcome section with title, subtitle and description", 
    badge: "2", 
    component: ConferenceWelcomeSection 
  },
  { 
    id: "event-spaces", 
    label: "Event Spaces", 
    icon: LayoutGrid, 
    description: "Manage the 3 event spaces with images", 
    badge: "3", 
    component: ConferenceEventSpacesSection 
  },
  { 
    id: "amenities", 
    label: "Amenities", 
    icon: Wifi, 
    description: "Manage the 6 amenities", 
    badge: "6", 
    component: ConferenceAmenitiesSection 
  },
  { 
    id: "stats", 
    label: "Statistics", 
    icon: BarChart3, 
    description: "Manage the 4 stat cards", 
    badge: "4", 
    component: ConferenceStatsSection 
  },
  { 
    id: "cta", 
    label: "Call to Action", 
    icon: Calendar, 
    description: "Manage the CTA section with button", 
    badge: "CTA", 
    component: ConferenceCtaSection 
  },
];

export default function ConferenceManager() {
  const [selectedSection, setSelectedSection] = useState(null);

  const openSection = (sectionId) => {
    setSelectedSection(sectionId);
  };

  const closeSection = () => {
    setSelectedSection(null);
  };

  if (selectedSection) {
    const section = sections.find(s => s.id === selectedSection);
    const SectionComponent = section.component;

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

        <SectionComponent />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conference Page Sections</h1>
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

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-500">
                Manage Section
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}