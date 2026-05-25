export interface HomepageSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  description: string;
  shortDescription: string;
  price: string;
  capacity: string;
  size: string;
  imageUrl: string;
  amenities: string[];
  featured: boolean;
  gallery: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface SiteData {
  homepage: {
    hero: HomepageSection;
    about: HomepageSection;
    features: HomepageSection;
    cta: HomepageSection;
  };
  property: Property[];
  testimonials: Testimonial[];
}

const defaultData: SiteData = {
  homepage: {
    hero: {
      id: "hero",
      title: "Welcome to Luxury Garden Palace",
      subtitle: "Experience Unparalleled Elegance",
      content: "Nestled in the heart of Kigali, Rwanda, Luxury Garden Palace offers an exquisite wedding venue and luxury accommodation experience. Our stunning gardens, world-class service, and breathtaking architecture create the perfect backdrop for your most cherished moments.",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
      ctaText: "Explore Our Venue",
      ctaLink: "#property",
    },
    about: {
      id: "about",
      title: "Our Story",
      subtitle: "A Legacy of Luxury & Elegance",
      content: "Luxury Garden Palace was born from a vision to create Rwanda's most prestigious wedding and event destination. Set within meticulously manicured gardens, our venue combines contemporary luxury with timeless African charm. Every detail, from the grand ballroom to the intimate garden pavilions, has been designed to exceed your expectations.",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
      ctaText: "Learn More",
      ctaLink: "#about",
    },
    features: {
      id: "features",
      title: "Why Choose Us",
      subtitle: "What Makes Us Special",
      content: "From our stunning outdoor ceremony spaces to our elegant indoor reception halls, we provide everything you need for an unforgettable celebration.",
      imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200",
      ctaText: "View All Features",
      ctaLink: "#features",
    },
    cta: {
      id: "cta",
      title: "Book Your Dream Wedding",
      subtitle: "Let's Create Something Beautiful Together",
      content: "Contact our team today to schedule a private tour of our stunning venue and begin planning the wedding of your dreams.",
      imageUrl: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200",
      ctaText: "Book Now",
      ctaLink: "#contact",
    },
  },
  property: [
    {
      id: "prop-1",
      name: "Grand Ballroom",
      type: "Indoor Venue",
      description: "Our magnificent Grand Ballroom is the crown jewel of Luxury Garden Palace. With soaring 20-foot ceilings, crystal chandeliers, and floor-to-ceiling windows overlooking the gardens, this space accommodates up to 500 guests for a truly grand celebration. The room features a spacious dance floor, a dedicated stage for live entertainment, and state-of-the-art sound and lighting systems. Adjacent pre-function areas and bridal suites ensure every moment of your event flows seamlessly.",
      shortDescription: "An elegant ballroom for up to 500 guests with crystal chandeliers and garden views.",
      price: "From $5,000",
      capacity: "500 guests",
      size: "6,000 sq ft",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      amenities: ["Crystal Chandeliers", "Dance Floor", "Stage", "Sound System", "Lighting System", "Bridal Suite", "Air Conditioning"],
      featured: true,
      gallery: [
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
      ],
    },
    {
      id: "prop-2",
      name: "Garden Pavilion",
      type: "Outdoor Venue",
      description: "Exchange your vows surrounded by nature's beauty in our enchanting Garden Pavilion. Set amidst lush tropical gardens with a backdrop of flowering bougainvillea and majestic palm trees, this open-air venue creates a romantic atmosphere for ceremonies and cocktail receptions. The pavilion features a elegant pergola structure, ambient lighting, and can accommodate up to 200 guests seated. A charming water fountain and manicured hedges complete the fairy-tale setting.",
      shortDescription: "A romantic outdoor pavilion nestled in tropical gardens for up to 200 guests.",
      price: "From $3,500",
      capacity: "200 guests",
      size: "4,000 sq ft",
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
      amenities: ["Pergola", "Garden Views", "Water Fountain", "Ambient Lighting", "Backup Rain Plan"],
      featured: true,
      gallery: [
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
        "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
      ],
    },
    {
      id: "prop-3",
      name: "Terrace Lounge",
      type: "Rooftop Venue",
      description: "Take your celebration to new heights at our stunning Terrace Lounge. Perched atop the main building, this rooftop venue offers panoramic views of Kigali's rolling hills and spectacular sunsets. Perfect for engagement parties, rehearsal dinners, and intimate receptions, the Terrace Lounge features a stylish bar, comfortable lounge seating, and retractable glass walls that allow you to enjoy the fresh air while staying protected from the elements.",
      shortDescription: "A chic rooftop venue with panoramic Kigali views for up to 120 guests.",
      price: "From $2,800",
      capacity: "120 guests",
      size: "2,500 sq ft",
      imageUrl: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
      amenities: ["Panoramic Views", "Bar", "Lounge Seating", "Retractable Walls", "Sunset Views"],
      featured: false,
      gallery: [
        "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
        "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800",
      ],
    },
    {
      id: "prop-4",
      name: "Intimate Garden Room",
      type: "Indoor Venue",
      description: "For more intimate gatherings, the Garden Room offers a warm and inviting space bathed in natural light. French doors open onto a private courtyard garden, allowing for seamless indoor-outdoor flow. With its exposed wooden beams, fireplace, and elegant décor, this room is ideal for rehearsal dinners, bridal showers, and small wedding receptions of up to 60 guests. The adjacent catering kitchen ensures impeccable service for your event.",
      shortDescription: "A cozy, light-filled room with private courtyard for intimate events up to 60 guests.",
      price: "From $1,800",
      capacity: "60 guests",
      size: "1,200 sq ft",
      imageUrl: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800",
      amenities: ["Private Courtyard", "Fireplace", "French Doors", "Catering Kitchen", "Natural Light"],
      featured: false,
      gallery: [
        "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      ],
    },
  ],
  testimonials: [
    {
      id: "test-1",
      name: "Grace & Emmanuel",
      role: "Wedding - June 2024",
      content: "Our wedding at Luxury Garden Palace was absolutely magical. The Grand Ballroom took our breath away, and the staff went above and beyond to make our day perfect. Every detail was flawless.",
      avatar: "",
      rating: 5,
    },
    {
      id: "test-2",
      name: "Sarah & David",
      role: "Wedding - March 2024",
      content: "We fell in love with the Garden Pavilion the moment we saw it. The natural beauty of the surroundings made our ceremony so romantic. Thank you for creating the wedding of our dreams!",
      avatar: "",
      rating: 5,
    },
    {
      id: "test-3",
      name: "Isabelle & Jean-Paul",
      role: "Wedding - December 2023",
      content: "The Terrace Lounge was the perfect setting for our evening reception. Watching the sunset over Kigali with our closest friends and family was an unforgettable experience.",
      avatar: "",
      rating: 5,
    },
  ],
};

const STORAGE_KEY = "luxury-garden-admin-data";

export function loadSiteData(): SiteData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as SiteData;
  } catch { /* fall through */ }
  return JSON.parse(JSON.stringify(defaultData));
}

export function saveSiteData(data: SiteData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetToDefault(): SiteData {
  const fresh = JSON.parse(JSON.stringify(defaultData));
  saveSiteData(fresh);
  return fresh;
}
