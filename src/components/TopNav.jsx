import React, { useEffect, useState } from "react";

export default function TopNav() {
  const [hideMobileTopNav, setHideMobileTopNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHideMobileTopNav(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed left-0 right-0 top-0 z-[70] w-full border-b border-[#8f7a45] transition-transform duration-300 ${
        hideMobileTopNav ? "-translate-y-full lg:translate-y-0" : "translate-y-0"
      }`}
    >
      {/* Bottom gold bar only */}
      <div className="h-[40px] bg-[#a18a4d]">
        <div className="mx-auto flex h-full max-w-[1900px] items-center justify-center px-4">
          <a
            href="https://www.mountainviewresort.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-center text-[10px] font-normal uppercase tracking-[0.14em] text-white transition hover:opacity-90 sm:text-[11px] md:text-[13px]"
          >
            <span className="text-[14px] leading-none md:text-[16px]">‹</span>
            <span>Take Me Back To Mountain View Resort Website</span>
          </a>
        </div>
      </div>
    </div>
  );
}