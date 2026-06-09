import { useState, useEffect } from "react";
import { Menu, X, Cpu, MessageSquare } from "lucide-react";

interface NavbarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenAssistant: () => void;
}

export default function Navbar({ activeSection, setActiveSection, onOpenAssistant }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleNavClick = (id: string) => {
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
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#07131F]/90 backdrop-blur-md border-b border-white/10 py-4 shadow-lg shadow-black/10"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick("home")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF7B54] flex items-center justify-center shadow-lg shadow-[#FF6B4A]/30 group-hover:scale-105 transition-transform">
            <Cpu className="text-white w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight block">
              Ravi Mali
            </span>
            <span className="text-[#FF7B54] text-xs font-mono tracking-wider -mt-1 block">
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
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={onOpenAssistant}
            className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-[#FF6B4A] hover:bg-white/[0.1] transition-all cursor-pointer"
            title="Talk to AI"
          >
            <MessageSquare className="w-5 h-5 animate-pulse" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/10 text-white hover:bg-white/[0.1] transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#0D1B2A] border-l border-white/10 shadow-2xl p-6 z-50 flex flex-col justify-between transform transition-transform duration-300 animate-slide-in">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-white font-bold text-lg">Menu Navigation</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-white/[0.05] text-[#BFC8D6] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left p-3.5 rounded-xl font-medium text-base transition-all ${
                    activeSection === item.id
                      ? "bg-[#FF6B4A]/10 text-[#FF6B4A] border-l-4 border-[#FF6B4A]"
                      : "text-[#BFC8D6] hover:bg-white/[0.03] hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAssistant();
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#FF6B4A] text-white py-3 rounded-xl font-medium shadow-xl shadow-[#FF6B4A]/20"
            >
              <MessageSquare className="w-5 h-5" />
              Chat Ravi's AI Twin
            </button>
            <p className="text-center text-xs text-[#7A8799] font-mono">
              v1.2.0 • Active Server Mode
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
