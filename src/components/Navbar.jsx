import { useState, useEffect } from "react";
import { Menu, X, Cpu, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar({ activeSection, setActiveSection, onOpenAssistant }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent background body scrolling when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Skills", id: "skills" },
    { label: "Projects", id: "projects" },
    { label: "Experience", id: "experience" },
    { label: "Contact", id: "contact" },
  ];

  const handleNavClick = (id) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 80; // height of sticky navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      id="main-nav"
      className={`fixed top-0 left-0 w-full transition-all duration-300 ${
        mobileMenuOpen ? "z-[100]" : "z-50"
      } ${
        scrolled
          ? "bg-[#07131F]/90 backdrop-blur-md border-b border-white/10 py-3.5 sm:py-4 shadow-lg shadow-black/10"
          : "bg-transparent py-5 sm:py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick("home")} 
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0 select-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF7B54] flex items-center justify-center shadow-lg shadow-[#FF6B4A]/30 group-hover:scale-105 transition-transform shrink-0">
            <Cpu className="text-white w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </div>
          <div className="leading-tight">
            <span className="text-white font-bold text-base sm:text-lg tracking-tight block">
              Ravi Mali
            </span>
            <span className="text-[#FF7B54] text-[90%] sm:text-xs font-mono tracking-normal sm:tracking-wider -mt-0.5 block">
              FUTURE RE-ENGINEER
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center bg-white/[0.03] border border-white/5 rounded-full px-6 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-1.5 text-sm font-medium transition-all duration-300 rounded-full cursor-pointer ${
                  activeSection === item.id
                    ? "text-[#FF6B4A]"
                    : "text-[#BFC8D6] hover:text-white"
                }`}
              >
                {item.label}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FF6B4A] rounded-full" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 bg-[#FF6B4A] hover:bg-[#FF7B54] text-white px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 select-none shadow-lg shadow-[#FF6B4A]/25 cursor-pointer hover:shadow-[#FF6B4A]/40"
          >
            <MessageSquare className="w-4 h-4" />
            Talk to AI Twin
          </button>
        </div>

        {/* Mobile Navbar Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 lg:hidden shrink-0">
          <button
            onClick={onOpenAssistant}
            className="p-2 sm:p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-[#FF6B4A] hover:bg-white/[0.1] transition-all cursor-pointer min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
            title="Talk to AI"
          >
            <MessageSquare className="w-4.5 h-4.5 sm:w-5 sm:h-5 animate-pulse" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.1] transition-all cursor-pointer min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Advanced Mobile Drawer with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
            />

            {/* Slide-out Sidebar Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-[280px] sm:max-w-[320px] bg-[#07131F]/98 backdrop-blur-xl border-l border-white/10 shadow-2xl p-5 sm:p-6 z-[100] flex flex-col justify-between"
            >
              <div className="flex flex-col gap-6">
                {/* Header Section inside menu with close option */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF7B54] flex items-center justify-center shadow-md">
                      <Cpu className="text-white w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm tracking-tight block">
                        Ravi Mali
                      </span>
                      <span className="text-[#FF7B54] text-[9px] font-mono tracking-wider block uppercase">
                        Navigation
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/[0.12] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Staggered Navigation Items with visual active indicator */}
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[55vh]">
                  {navItems.map((item, idx) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => handleNavClick(item.id)}
                      className={`text-left w-full px-4 py-3 rounded-xl font-medium text-base transition-all flex items-center justify-between cursor-pointer min-h-[46px] ${
                        activeSection === item.id
                          ? "bg-[#FF6B4A]/15 text-white border-l-4 border-[#FF6B4A] font-semibold"
                          : "text-[#BFC8D6] hover:bg-white/[0.03] hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      {activeSection === item.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] shadow-md shadow-[#FF6B4A]" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Bottom Drawer Actions with premium button styling */}
              <div className="flex flex-col gap-4 border-t border-white/5 pt-5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAssistant();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6B4A] hover:bg-[#FF7B54] text-white py-3 px-4 rounded-xl font-medium shadow-xl shadow-[#FF6B4A]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 min-h-[46px]"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  Chat Ravi's AI Twin
                </button>
                <div className="flex justify-between items-center px-1 font-mono text-[9px] text-[#7A8799]">
                  <span>PORTAL v1.2.0</span>
                  <span>SECURE CLOUD ENGINE</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
