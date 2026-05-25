import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "ROOMS", href: "/rooms" },
  { label: "SERVICES", href: "/services" },
  { label: "RESTAURANT", href: "/restaurant" },
  { label: "CONFERENCE", href: "/conference" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
  { label: "GALLERY", href: "/gallery" },
];

const overlayPages = [
  "/",
  "/rooms",
  "/services",
  "/restaurant",
  "/conference",
  "/about",
  "/contact",
  "/gallery",
];

function SiteLogo({ isSolid = false, menuVersion = false }) {
  return (
    <Link to="/" className="shrink-0">
      <img
        src="/mv-logo.png"
        alt="Mountain View Resort Logo"
        className={`w-auto object-contain transition-all duration-300 drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] ${
          menuVersion
            ? "h-[58px] max-w-[220px] sm:h-[64px]"
            : isSolid
            ? "h-[86px] max-w-[280px] lg:h-[72px] lg:max-w-[210px]"
            : "h-[108px] max-w-[360px] lg:h-[78px] lg:max-w-[240px]"
        }`}
      />
    </Link>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isOverlayPage = overlayPages.includes(location.pathname);
  const hasSolidHeader = isScrolled || !isOverlayPage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className="fixed left-0 right-0 top-[40px] z-[60] transition-all duration-300"
    >
      <div
        className={`transition-all duration-300 ${
          hasSolidHeader
            ? "border-b border-white/20 bg-[rgba(110,116,120,0.88)] shadow-xl backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-10">
          {/* Mobile */}
          <div
            className={`flex items-center justify-center lg:hidden transition-all duration-300 ${
              hasSolidHeader ? "min-h-[92px]" : "min-h-[118px]"
            }`}
          >
            <SiteLogo isSolid={hasSolidHeader} />
          </div>

          {/* Desktop */}
          <div className="hidden lg:grid lg:min-h-[84px] lg:grid-cols-[260px_minmax(0,1fr)_260px] lg:items-center lg:gap-6 xl:min-h-[88px]">
            {/* Logo */}
            <div className="flex items-center">
              <SiteLogo isSolid={hasSolidHeader} />
            </div>

            {/* Center nav */}
            <nav className="flex items-center justify-center gap-8 xl:gap-12">
              {navLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive }) =>
                    `relative inline-flex items-center justify-center pb-1 text-[15px] font-light uppercase tracking-[0.08em] transition xl:text-[16px] ${
                      isActive
                        ? "text-white"
                        : "text-white/95 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <span className="relative">
                      {item.label}
                      <span
                        className={`absolute -bottom-[10px] left-0 h-[1.5px] w-full bg-white/90 origin-center transition-all duration-300 ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* CTA */}
            <div className="flex items-center justify-end">
              <Link
                to="/contact"
                className="inline-flex min-h-[44px] min-w-[210px] items-center justify-center bg-[#a8914f] px-8 text-[15px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#947f46] xl:min-h-[46px] xl:min-w-[220px]"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            mobileOpen
              ? "max-h-[420px] border-t border-white/15 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-[rgba(90,95,100,0.96)] px-4 py-3 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <SiteLogo menuVersion />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-[28px] leading-none text-white"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <nav className="flex flex-col">
              {navLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-white/10 py-4 text-sm uppercase tracking-[0.12em] transition ${
                      isActive
                        ? "text-[#e4d3a0]"
                        : "text-white hover:text-[#e4d3a0]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-4 inline-flex min-h-[48px] items-center justify-center bg-[#a8914f] px-5 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#947f46]"
              >
                Book Now
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}