import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { 
  Code, Cpu, Palette, Layout, Sparkles, Server, FolderGit2,
  Database, Layers, GitBranch, Terminal, Send, Github, 
  Linkedin, Twitter, Mail, Plus, Check, ExternalLink, 
  FileText, Calendar, Award, Briefcase, Trash2, Inbox, 
  ChevronRight, Star, MessageSquare, X, SendHorizonal, 
  User, CheckCircle2, ShieldAlert, ArrowUpRight, HelpCircle
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import Navbar from "./components/Navbar";
import { generateResumePdf } from "./utils/pdfGenerator";
import { PROJECTS, SKILL_CATEGORIES, EXPERIENCE_TIMELINE, TESTIMONIALS, CERTIFICATIONS } from "./data";
import { Project, ChatMessage, ContactFormData, ContactMessageLog, Certification } from "./types";

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  
  // AI Twin Chat Bot States
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello there! 👋 I am **Ravi's AI Twin**, trained to answer questions about his software development skills, professional internships, featured projects, and career aspirations. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Animated counters
  const [projectsCount, setProjectsCount] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);
  const [commitsCount, setCommitsCount] = useState(0);
  const [internMinutes, setInternMinutes] = useState(0);

  // Contact form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Received messages logged in the browser for recruiters to audit
  const [recruiterMessages, setRecruiterMessages] = useState<ContactMessageLog[]>([]);
  const [showRecruiterLogs, setShowRecruiterLogs] = useState(false);

  // Sound preview alert states
  const [systemAlert, setSystemAlert] = useState<string | null>(null);

  // Resume downloading states
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Custom Avatar States with local persistence & automatic format checks
  const [avatarSrc, setAvatarSrc] = useState<string | null>(() => {
    return localStorage.getItem("ravi_portfolio_avatar");
  });
  const [avatarError, setAvatarError] = useState(false);
  const [imageFormatIndex, setImageFormatIndex] = useState(0);
  const formats = [
    "https://plain-apac-prod-public.komododecks.com/202606/09/rxtswuMzXBvoj8eRcXjG/image.jpg",
    "/assets/ravi_avatar.jpg",
    "/assets/ravi_avatar.png",
    "/assets/ravi_avatar.jpeg",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300" // premium unsplash developer placeholder as ultimate fallback
  ];

  const handleAvatarError = () => {
    if (!avatarSrc) {
      if (imageFormatIndex < formats.length - 1) {
        setImageFormatIndex((prev) => prev + 1);
      } else {
        setAvatarError(true);
      }
    } else {
      // If base64 failed, clear it and fall back to local assets
      setAvatarSrc(null);
      setImageFormatIndex(0);
    }
  };

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        try {
          localStorage.setItem("ravi_portfolio_avatar", base64String);
          setAvatarSrc(base64String);
          setAvatarError(false);
          triggerSystemAlert("Avatar updated successfully!");
        } catch (err) {
          triggerSystemAlert("Image exceeds storage capacity. Try a smaller compressed file.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // GitHub Integration States
  const [githubUsername, setGithubUsername] = useState("ravimali-dev");
  const [searchUsernameInput, setSearchUsernameInput] = useState("ravimali-dev");
  const [githubData, setGithubData] = useState<any>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"heatmap" | "chart">("heatmap");

  const fetchGithubData = async (username: string) => {
    setGithubLoading(true);
    setGithubError(null);
    try {
      const res = await fetch(`/api/github/profile?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setGithubData(data);
      } else {
        setGithubError("Failed to fetch GitHub synchronization profile.");
      }
    } catch (e) {
      setGithubError("Unable to establish backend socket connection.");
    } finally {
      setGithubLoading(false);
    }
  };

  useEffect(() => {
    fetchGithubData(githubUsername);
  }, [githubUsername]);

  // Count up animation effect
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const intervalTime = duration / steps;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      setProjectsCount(Math.min(Math.floor((12 / steps) * stepCount), 12));
      setSkillsCount(Math.min(Math.floor((15 / steps) * stepCount), 15));
      setCommitsCount(Math.min(Math.floor((1482 / steps) * stepCount), 1482));
      setInternMinutes(Math.min(Math.floor((180 / steps) * stepCount), 180));

      if (stepCount >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Sync scroll positioning to trigger active navbar
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "skills", "projects", "experience", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch submitted recruiter logs to prove actual storage & fullstack capabilities
  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setRecruiterMessages(data);
      }
    } catch (e) {
      console.error("Error loading messages database:", e);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Scroll chatbot to bottom when history changes
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatLoading]);

  // Handle Form Validation & Submission
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof ContactFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ContactFormData> = {};
    if (!formData.name.trim()) errors.name = "Your name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) errors.subject = "Please provide a subject";
    if (!formData.message.trim()) errors.message = "Message cannot be empty";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitSuccess(true);
        triggerSystemAlert("Message logged securely to Express server database!");
        setFormData({ name: "", email: "", subject: "", message: "" });
        fetchMessages(); // Refresh local list
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        triggerSystemAlert("Failed to send message. Please try again.");
      }
    } catch (error) {
      triggerSystemAlert("Network error saved locally. Check server configurations.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chat request with Gemini
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      // Map history format to be clean for model
      const historyPayload = chatHistory.map(item => ({
        role: item.role,
        text: item.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg.text,
          history: historyPayload
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, {
          role: "model",
          text: data.response || "No response received",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        const errData = await response.json();
        setChatHistory(prev => [...prev, {
          role: "model",
          text: `⚠️ **Server Notification:** ${errData.error || "The AI Twin is temporarily resting. Make sure to supply your GEMINI_API_KEY in the Secrets panel."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, {
        role: "model",
        text: "⚠️ **Connection Error**: Unable to contact the backend AI broker. Check if server process is running.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Helper alert popover
  const triggerSystemAlert = (msg: string) => {
    setSystemAlert(msg);
    setTimeout(() => setSystemAlert(null), 4000);
  };

  const handleDownloadResume = () => {
    if (downloadingResume || downloadSuccess) return;
    
    setDownloadingResume(true);
    triggerSystemAlert("Compiling official developer resume PDF on-the-fly...");
    
    setTimeout(() => {
      try {
        generateResumePdf({ username: githubUsername });
        setDownloadingResume(false);
        setDownloadSuccess(true);
        triggerSystemAlert("Ravi Mali CV downloaded successfully!");
        
        setTimeout(() => {
          setDownloadSuccess(false);
        }, 3000);
      } catch (err) {
        console.error(err);
        setDownloadingResume(false);
        triggerSystemAlert("Authentication token block. Try again.");
      }
    }, 1200);
  };

  // Clear server message inbox (Admin proof-of-concept)
  const handleClearInbox = async () => {
    if (!confirm("Are you sure you want to clear the visitor messages db file?")) return;
    try {
      const res = await fetch("/api/messages", { method: "DELETE" });
      if (res.ok) {
        setRecruiterMessages([]);
        triggerSystemAlert("Server database inbox cleared successfully.");
      }
    } catch (e) {
      triggerSystemAlert("Failed to clear backend database.");
    }
  };

  // Match corresponding icon names to Lucide elements
  const renderSkillIcon = (iconName: string) => {
    switch (iconName) {
      case "Code": return <Code className="w-5 h-5 text-[#FF6B4A]" />;
      case "Cpu": return <Cpu className="w-5 h-5 text-[#FF6B4A]" />;
      case "Palette": return <Palette className="w-5 h-5 text-[#FF6B4A]" />;
      case "Layout": return <Layout className="w-5 h-5 text-[#FF6B4A]" />;
      case "Sparkles": return <Sparkles className="w-5 h-5 text-[#FF6B4A]" />;
      case "Server": return <Server className="w-5 h-5 text-[#FF6B4A]" />;
      case "ShieldAlert": return <ShieldAlert className="w-5 h-5 text-[#FF6B4A]" />;
      case "Database": return <Database className="w-5 h-5 text-[#FF6B4A]" />;
      case "Layers": return <Layers className="w-5 h-5 text-[#FF6B4A]" />;
      case "GitBranch": return <GitBranch className="w-5 h-5 text-[#FF6B4A]" />;
      case "Terminal": return <Terminal className="w-5 h-5 text-[#FF6B4A]" />;
      case "Send": return <Send className="w-5 h-5 text-[#FF6B4A]" />;
      default: return <HelpCircle className="w-5 h-5 text-[#FF6B4A]" />;
    }
  };

  // Filter projects by main tech group and multi-select tech tag combinations
  const filteredProjects = PROJECTS.filter(p => {
    // 1. Filter by category
    if (activeFilter !== "All") {
      let matchesCategory = false;
      if (activeFilter === "Frontend") {
        matchesCategory = p.tech.some(t => ["React", "HTML5", "CSS3", "Tailwind CSS", "Motion", "JavaScript"].includes(t));
      } else if (activeFilter === "Backend") {
        matchesCategory = p.tech.some(t => ["Node.js", "Express.js", "MongoDB", "Auth", "Express"].includes(t));
      } else if (activeFilter === "API & Database") {
        matchesCategory = p.tech.some(t => ["MongoDB", "MySQL", "Rest API", "Gemini 3.5", "Appwrite"].includes(t));
      }
      if (!matchesCategory) return false;
    }
    
    // 2. Filter by specific technology combination (Multi-select)
    if (selectedTechs.length > 0) {
      return selectedTechs.every(selectedT => p.tech.includes(selectedT));
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07131F] bg-grid-pattern relative text-white selection:bg-[#FF6B4A] selection:text-white">
      
      {/* Dynamic alert popover */}
      {systemAlert && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#0D1B2A] border border-[#FF6B4A] shadow-2xl flex items-center gap-3 animate-slide-in">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A] animate-ping" />
          <span className="text-sm font-medium text-[#BFC8D6]">{systemAlert}</span>
        </div>
      )}

      {/* STICKY HEADER */}
      <Navbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        onOpenAssistant={() => setIsAssistantOpen(true)} 
      />

      {/* HERO SECTION */}
      <section 
        id="home" 
        className="pt-32 pb-24 md:pt-40 md:pb-36 max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-col lg:flex-row items-center gap-12 relative min-h-[90vh]"
      >
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#FF6B4A]/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Hero Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center relative z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 text-[#FF6B4A] text-xs font-bold font-mono uppercase tracking-wider mb-8 w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A] animate-pulse"></span>
            Ready for Summer Internship • June 2026
          </div>

          <h3 className="text-xl md:text-2xl font-mono text-[#FF7B54] font-medium tracking-tight mb-2">
            Hello, I'm
          </h3>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6 font-sans">
            Ravi Mali
          </h1>

          <h2 className="text-2xl md:text-3.5xl font-bold bg-gradient-to-r from-white via-[#BFC8D6] to-[#7A8799] bg-clip-text text-transparent mb-6">
            Frontend Developer | React Developer
          </h2>

          <p className="text-[#BFC8D6] text-base md:text-lg mb-10 leading-relaxed max-w-xl">
            I craft visually striking, modular, and highly inclusive web client systems. 
            Emphasizing precise timing layouts, state-driven interfaces, and rich developer user journeys.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <a 
              href="#projects"
              className="px-8 py-4 bg-[#FF6B4A] hover:bg-[#FF7B54] text-white rounded-2xl font-semibold shadow-lg shadow-[#FF6B4A]/20 hover:shadow-[#FF6B4A]/40 transition-all text-center select-none cursor-pointer"
            >
              View Projects
            </a>
            
            <a 
              href="#contact"
              className="px-8 py-4 bg-white/[0.04] border border-white/10 hover:border-white/20 text-[#BFC8D6] hover:text-white rounded-2xl font-semibold transition-all text-center select-none cursor-pointer"
            >
              Contact Me
            </a>

            <button 
              onClick={handleDownloadResume}
              disabled={downloadingResume}
              id="hero-download-resume-btn"
              className={`px-6 py-4 rounded-2xl font-semibold text-sm font-mono flex items-center justify-center gap-2.5 transition-all outline-none border focus:ring-2 focus:ring-[#FF6B4A]/50 select-none cursor-pointer ${
                downloadSuccess 
                ? "bg-green-500/10 border-green-500 text-green-400" 
                : downloadingResume
                ? "bg-white/[0.02] border-white/5 text-[#7A8799]"
                : "bg-white/[0.04] border-white/10 hover:border-[#FF6B4A]/30 text-[#FF7B54] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {downloadingResume ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-white animate-spin" />
                  <span>Compiling PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span>Resume Ready!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-[#FF7B54]" />
                  <span>Download CV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hero Right Visual Column - Inspired by the blueprint image */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative">
          <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] flex items-center justify-center">
            
            {/* Background glowing blur blob */}
            <div className="absolute w-80 h-80 bg-[#FF6B4A]/10 rounded-full blur-[100px] animate-pulse-slow" />

            {/* Glowing ring */}
            <div className="absolute inset-0 rounded-full border border-white/10 animate-spin" style={{ animationDuration: '24s' }} />
            <div className="absolute inset-4 rounded-full border border-dashed border-[#FF6B4A]/20 animate-spin" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
            
            {/* Central glass circle containing Ravi's visual avatar with custom image upload support */}
            <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-[#101D2E] to-[#07131F] border-2 border-white/15 overflow-hidden flex flex-col items-center justify-center shadow-2xl group cursor-pointer orange-glow-hover transition-all duration-500">
              
              {/* Load custom image (uploaded Base64) or fallback assets */}
              {(!avatarError && (avatarSrc || formats[imageFormatIndex])) ? (
                <img 
                  src={avatarSrc || formats[imageFormatIndex]} 
                  alt="Ravi Mali Profile"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                  onError={handleAvatarError}
                />
              ) : null}

              {/* Standard text RM layout fallback when no images load */}
              {(avatarError || (!avatarSrc && !formats[imageFormatIndex])) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B4A]/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Initials placeholder visual representation */}
                  <span className="text-8xl sm:text-9xl font-black tracking-tight text-white/5 select-none font-mono">
                    RM
                  </span>
                  <div className="absolute text-center mt-4">
                    <span className="block text-4xl sm:text-5xl font-black text-white leading-none">RAVI</span>
                    <span className="block text-sm sm:text-base font-mono text-[#FF7B54] tracking-widest mt-1">MALI</span>
                  </div>
                </div>
              )}

              {/* Upload dynamic layer showing on hover */}
              <label 
                htmlFor="avatar-upload"
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-center p-4 z-20"
              >
                <div className="p-2 rounded-lg bg-[#FF6B4A]/20 text-[#FF7B54] mb-2 border border-[#FF6B4A]/30">
                  <User className="w-5 h-5 mx-auto" />
                </div>
                <span className="text-white text-xs font-bold tracking-tight">Upload Photo</span>
                <span className="text-[10px] text-[#BFC8D6] font-mono mt-0.5">Click to select file</span>
              </label>

              {/* Hidden file input */}
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                className="hidden" 
              />
            </div>

            {/* Floating tech badges */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0D1B2A]/90 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 select-none animate-float">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B4A]" />
              <span className="text-xs font-mono font-bold text-white">React specialist</span>
            </div>

            <div className="absolute bottom-6 -right-2 bg-[#0D1B2A]/90 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 select-none animate-float-delayed">
              <span className="text-[#FF7B54] font-bold font-mono text-sm">TypeScript</span>
            </div>

            <div className="absolute bottom-12 -left-4 bg-[#0D1B2A]/90 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 select-none animate-float">
              <span className="text-xs text-[#BFC8D6] font-mono leading-none">Node / Express</span>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STRIP */}
      <div className="border-y border-white/5 bg-white/[0.01] py-8 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-wrap items-center justify-around gap-y-6 text-sm font-semibold tracking-wider text-[#7A8799] font-mono uppercase">
          <div className="flex items-center gap-2 hover:text-[#FF6B4A] transition-colors"><Cpu className="w-4 h-4 text-[#FF6B4A]" /> React 19</div>
          <div className="flex items-center gap-2 hover:text-[#FF6B4A] transition-colors"><Code className="w-4 h-4 text-[#FF6B4A]" /> Tailwind CSS v4</div>
          <div className="flex items-center gap-2 hover:text-[#FF6B4A] transition-colors"><GitBranch className="w-4 h-4 text-[#FF6B4A]" /> Node JS</div>
          <div className="flex items-center gap-2 hover:text-[#FF6B4A] transition-colors"><Database className="w-4 h-4 text-[#FF6B4A]" /> MongoDB / MySQL</div>
          <div className="flex items-center gap-2 hover:text-[#FF6B4A] transition-colors"><Terminal className="w-4 h-4 text-[#FF6B4A]" /> Postman API</div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <section id="about" className="py-24 max-w-[1400px] mx-auto px-6 sm:px-12 scroll-mt-20">
        <div className="flex flex-col lg:flex-row items-stretch gap-16">
          
          {/* Left: Illustrated Developer Workspace Graphic (Mock Terminal) */}
          <div className="w-full lg:w-5/12 flex flex-col justify-center">
            <div className="w-full rounded-2xl bg-[#0D1B2A] border border-white/10 shadow-2xl overflow-hidden p-6 relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B4A]" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <span className="text-xs text-[#7A8799] font-mono">ravi-mali.ts</span>
              </div>

              {/* Code editor content block */}
              <div className="text-sm font-mono text-[#BFC8D6] space-y-3 overflow-x-auto leading-relaxed">
                <p><span className="text-[#FF6B4A]">const</span> developer = &#123;</p>
                <p className="pl-4">name: <span className="text-[#FF7B54]">"Ravi Mali"</span>,</p>
                <p className="pl-4">role: <span className="text-[#FF7B54]">"Frontend Developer"</span>,</p>
                <p className="pl-4">currentFocus: <span className="text-[#FF7B54]">"Clean responsive UI & API design"</span>,</p>
                <p className="pl-4">passion: <span className="text-[#FF7B54]">"Building interfaces that feel like poetry"</span>,</p>
                <p className="pl-4">stats: &#123;</p>
                <p className="pl-8">commitsIn2025: <span className="text-[#FF6B4A]">2400+</span>,</p>
                <p className="pl-8">satisfactionRate: <span className="text-[#FF6B4A]">"100%"</span></p>
                <p className="pl-4">&#125;</p>
                <p>&#125;;</p>
                <br />
                <p className="text-[#7A8799]">// Seeking Tech Intern positions starting summer 2026</p>
                <p className="text-[#FF6B4A]">export default developer;</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute bottom-3 right-3 opacity-20">
                <Cpu className="w-16 h-16 text-[#FF6B4A]" />
              </div>
            </div>
          </div>

          {/* Right: Content details */}
          <div className="w-full lg:w-7/12 flex flex-col justify-between text-left">
            <div>
              <div className="text-[#FF6B4A] font-mono text-sm tracking-widest uppercase mb-3 font-bold flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
                About Me
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-8">
                Building Modern, Purposeful Web Solutions
              </h2>

              <div className="space-y-6 text-[#BFC8D6] text-base md:text-lg leading-relaxed">
                <p>
                  I'm <strong>Ravi Mali</strong>, an interactive software crafter currently specialized onFrontend development and scaling towards full-stack environments. My technical journey roots back to bridging the gap between design fidelity and strict backend performance limits.
                </p>
                <p>
                  I deeply care about structured layouts, elegant color balances, and responsive accessibility parameters. Over my internships, I’ve refined a rigorous component strategy, utilizing React trees alongside Express setups to execute clean API communications quickly.
                </p>
                <p>
                  My immediate goal is to contribute to high-growth development engineering clusters where I can apply my knowledge, write robust typescript pipelines, and team up on production-scale web client systems.
                </p>
              </div>
            </div>

            {/* Simulated Animated Counters Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 border-t border-white/5 pt-8">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono flex items-center justify-center sm:justify-start">
                  {projectsCount}+
                </div>
                <div className="text-xs text-[#7A8799] uppercase tracking-wide mt-1 font-mono">
                  Projects Shipped
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono flex items-center justify-center sm:justify-start">
                  {skillsCount}+
                </div>
                <div className="text-xs text-[#7A8799] uppercase tracking-wide mt-1 font-mono">
                  Stack Assets
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono flex items-center justify-center sm:justify-start">
                  {commitsCount}+
                </div>
                <div className="text-xs text-[#7A8799] uppercase tracking-wide mt-1 font-mono">
                  Commits Tracked
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FF6B4A]/5 border border-[#FF6B4A]/10 text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-extrabold text-[#FF6B4A] font-mono flex items-center justify-center sm:justify-start">
                  {internMinutes}d
                </div>
                <div className="text-xs text-[#FF6B4A]/80 uppercase tracking-wide mt-1 font-mono">
                  Intern Experience
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SKILLS SECTION (Interactive Category Switcher) */}
      <section id="skills" className="py-24 bg-[#0D1B2A]/40 border-y border-white/5 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 text-left">
          
          <div className="max-w-3xl mb-16">
            <div className="text-[#FF6B4A] font-mono text-sm tracking-widest uppercase mb-3 font-bold flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
              Technical Competence
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              My Technology Coordinates
            </h2>
            <p className="text-[#BFC8D6] text-base md:text-lg">
              Below are my primary frameworks, utility servers, and configuration assets verified through code sandbox pipelines.
            </p>
          </div>

          {/* Grid Layout of skill cards sorted by layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SKILL_CATEGORIES.map((cat, idx) => (
              <div 
                key={idx}
                className="rounded-2xl p-6 bg-white/[0.03] border border-white/10 hover:border-white/15 transition-all shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-[#FF6B4A]/10 flex items-center justify-center border border-[#FF6B4A]/20">
                      {idx === 0 ? <Layout className="w-5 h-5 text-[#FF6B4A]" /> : 
                       idx === 1 ? <Server className="w-5 h-5 text-[#FF6B4A]" /> : 
                       idx === 2 ? <Database className="w-5 h-5 text-[#FF6B4A]" /> : 
                       <Cpu className="w-5 h-5 text-[#FF6B4A]" />}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{cat.title}</h3>
                  </div>

                  <div className="space-y-5">
                    {cat.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#BFC8D6] font-medium font-poppins">{skill.name}</span>
                          <span className="text-[#FF6B4A] font-mono font-bold">{skill.level}%</span>
                        </div>
                        {/* Progress Bar wrapper */}
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#FF6B4A] to-[#FF7B54] h-full rounded-full transition-all duration-1000"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 mt-6 pt-4 text-[10px] text-[#7A8799] font-mono flex items-center justify-between">
                  <span>CLASS MODULE REGISTERED</span>
                  <span>ACTIVE</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FEATURED PROJECTS SECTION */}
      <section id="projects" className="py-24 max-w-[1400px] mx-auto px-6 sm:px-12 scroll-mt-20">
        <div className="text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="text-[#FF6B4A] font-mono text-sm tracking-widest uppercase mb-3 font-bold flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
              Selected Sandbox Work
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Verified Production Builds
            </h2>
            <p className="text-[#BFC8D6] text-base md:text-lg">
              Recruiters can browse and filter premium developer web applications below. Each utilizes distinct layout logic and fully operational frontend clients.
            </p>
          </div>

          {/* Filtering buttons */}
          <div className="flex flex-wrap gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-1.5 self-start lg:self-auto h-fit">
            {["All", "Frontend", "Backend", "API & Database"].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  triggerSystemAlert(`Filtered catalog by ${filter}`);
                }}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                  activeFilter === filter
                    ? "bg-[#FF6B4A] text-white shadow-md shadow-[#FF6B4A]/20"
                    : "text-[#BFC8D6] hover:text-white hover:bg-white/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Multi-Select Tech combination filtering hub */}
        <div className="mb-10 p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF6B4A]" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
                Filter by Tech Stack Combination (Select Multiple)
              </span>
            </div>
            {selectedTechs.length > 0 && (
              <button 
                onClick={() => {
                  setSelectedTechs([]);
                  triggerSystemAlert("Cleared technology filters");
                }}
                className="text-xs font-mono text-[#FF6B4A] hover:text-[#FF7B54] font-semibold flex items-center gap-1 hover:underline cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Combo ({selectedTechs.length})
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(PROJECTS.flatMap(p => p.tech))).map((t) => {
              const isActive = selectedTechs.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => {
                    if (isActive) {
                      setSelectedTechs(prev => prev.filter(tech => tech !== t));
                      triggerSystemAlert(`Removed ${t} filter`);
                    } else {
                      setSelectedTechs(prev => [...prev, t]);
                      triggerSystemAlert(`Added ${t} filter`);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive 
                      ? "bg-[#FF6B4A]/10 border-[#FF6B4A] text-[#FF7B54] font-bold shadow-sm shadow-[#FF6B4A]/10" 
                      : "border-white/10 text-[#BFC8D6] hover:text-white hover:border-white/20"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#FF7B54]" : "bg-white/30"}`} />
                  {t}
                </button>
              );
            })}
          </div>
          
          {selectedTechs.length > 0 && (
            <div className="mt-4 text-xs font-mono text-[#7A8799] flex flex-wrap items-center gap-2">
              <span>Matching any builds that contain:</span>
              <div className="flex flex-wrap gap-1 items-center">
                {selectedTechs.map((tech, sIdx) => (
                  <span key={tech} className="flex items-center bg-[#FF6B4A]/5 text-[#FF7B54] px-1.5 py-0.5 rounded border border-[#FF6B4A]/10">
                    {tech}
                    {sIdx < selectedTechs.length - 1 && <span className="mx-1.5 text-white/40">+</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Project Card Display Grid or Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-20 px-4 bg-white/[0.01] border border-white/5 rounded-2xl text-center">
            <FolderGit2 className="w-12 h-12 text-[#7A8799] mb-4 stroke-[1.5]" />
            <h3 className="text-lg font-bold text-white mb-2">No Matching sandbox builds</h3>
            <p className="text-xs text-[#7A8799] max-w-md mb-6 leading-relaxed">
              No developer projects match your exact multi-selected technology combination (<strong>{selectedTechs.join(" + ")}</strong>) under the active category. Try resetting filters to browse Ravi's full portfolio.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedTechs([]);
                  triggerSystemAlert("Cleared technology filters");
                }}
                className="px-4 py-2 text-xs font-mono font-bold bg-[#FF6B4A] hover:bg-[#FF7B54] text-white rounded-xl transition-all cursor-pointer shadow-md shadow-[#FF6B4A]/10"
              >
                Reset Tech Filters
              </button>
              {activeFilter !== "All" && (
                <button
                  onClick={() => {
                    setActiveFilter("All");
                    triggerSystemAlert("Reset active category");
                  }}
                  className="px-4 py-2 text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10 cursor-pointer"
                >
                  Show All Categories
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((p) => (
              <div 
                key={p.id}
                className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col justify-between group shadow-xl transition-all duration-300 hover:border-white/20 select-none"
              >
                <div>
                  {/* Visual Thumbnail */}
                  <div 
                    className="h-44 relative overflow-hidden flex items-center justify-center p-6"
                    style={{ background: p.image }}
                  >
                    {/* Subtle glass effect covering bottom half */}
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Interactive Code preview visual widget inside */}
                    <div className="relative z-10 w-full h-full rounded-lg bg-black/45 border border-white/10 p-3 flex flex-col justify-between text-left">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      </div>
                      <span className="text-[10px] text-white/50 font-mono tracking-tight block truncate">
                        {p.githubUrl.split("/").pop()}.tsx
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-[#FF7B54] font-bold uppercase tracking-widest bg-[#FF6B4A]/15 px-1.5 py-0.5 rounded">
                          DEPLOYED
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-[#FF6B4A] transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 text-left">
                    <h3 className="text-base font-bold text-white group-hover:text-[#FF7B54] transition-colors line-clamp-1 mb-2">
                      {p.title}
                    </h3>
                    
                    <p className="text-xs text-[#7A8799] mb-4 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {p.tech.map((t) => (
                        <span 
                          key={t}
                          className="text-[9px] font-mono text-[#BFC8D6] bg-white/[0.05] px-2 py-0.5 rounded-sm border border-white/5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action trigger links */}
                <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs font-mono">
                  <a 
                    href={p.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[#BFC8D6] hover:text-white hover:underline cursor-pointer"
                  >
                    <Github className="w-3.5 h-3.5" />
                    Source Code
                  </a>
                  
                  {p.id === "portfolio" ? (
                    <button 
                      onClick={() => setIsAssistantOpen(true)}
                      className="text-[#FF6B4A] hover:text-[#FF7B54] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Ask AI Twin
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <a 
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FF6B4A] hover:text-[#FF7B54] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      View Live
                      <ChevronRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EXPERIENCE / VERTICAL TIMELINE SECTION */}
      <section id="experience" className="py-24 bg-[#0D1B2A]/40 border-y border-white/5 scroll-mt-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 text-left">
          
          <div className="max-w-2xl mb-16">
            <div className="text-[#FF6B4A] font-mono text-sm tracking-widest uppercase mb-3 font-bold flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
              Timeline Record
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Professional Work Experience
            </h2>
            <p className="text-[#BFC8D6] text-base md:text-lg">
              My structured developer milestones proving code compliance and collaborative execution.
            </p>
          </div>

          {/* Interactive Timeline Layout */}
          <div className="relative border-l border-white/10 pl-6 md:pl-12 ml-4 space-y-12">
            
            {/* Timeline Item 1 - TechNova Solutions */}
            {EXPERIENCE_TIMELINE.map((item, idx) => (
              <div key={idx} className="relative group">
                
                {/* Visual Circle Indicator */}
                <div className="absolute -left-[31px] md:-left-[55px] top-1.5 w-5 h-5 rounded-full bg-[#07131F] border-2 border-[#FF6B4A] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A] group-hover:scale-150 transition-transform" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white/[0.02] border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl hover:border-white/15 transition-all">
                  
                  {/* Left Role Header Column */}
                  <div className="lg:col-span-4 flex flex-col justify-start">
                    <span className="text-[#FF6B4A] font-mono text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.duration}
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">{item.role}</h3>
                    <h4 className="text-base text-[#FF7B54] font-medium font-mono tracking-tight mt-1">
                      {item.company}
                    </h4>

                    {/* Verified tags used in role */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {item.techUsed.map((tech) => (
                        <span 
                          key={tech} 
                          className="text-[9px] font-mono text-[#BFC8D6] bg-white/[0.05] px-2 py-0.5 rounded border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Responsibilities details columns */}
                  <div className="lg:col-span-8 text-left space-y-6">
                    <div>
                      <h5 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                        Core Responsibilities & Milestones
                      </h5>
                      <ul className="space-y-2.5 text-sm text-[#BFC8D6] list-disc list-inside leading-relaxed">
                        {item.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx} className="text-left">{resp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <h5 className="text-sm font-bold text-[#FF7B54] uppercase tracking-wider mb-2">
                        Learning Path & Achievements
                      </h5>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#BFC8D6] font-mono">
                        {item.learningJourney.map((learn, lIdx) => (
                          <li key={lIdx} className="flex items-center gap-2">
                            <span className="text-[#FF6B4A]">➔</span>
                            <span>{learn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* Simulated milestones to enrich layout depth */}
            <div className="relative group">
              <div className="absolute -left-[31px] md:-left-[55px] top-1 w-5 h-5 rounded-full bg-[#07131F] border-2 border-white/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              </div>
              <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl ml-1 text-left opacity-60">
                <span className="text-xs font-mono text-[#7A8799]">SEPTEMBER 2024</span>
                <h4 className="text-sm font-bold text-[#BFC8D6] mt-1">Open Source Contributor • Developer Cohort</h4>
                <p className="text-xs text-[#7A8799] mt-1">
                  Built custom SVG metrics graphics and utility helper components using D3 analytics packages.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* GITHUB INTEGRATION SHOWCASE */}
      <section className="py-24 max-w-[1400px] mx-auto px-6 sm:px-12 scroll-mt-20">
        <div className="text-left flex flex-col lg:flex-row items-stretch gap-12">
          
          {/* Left Panel: Profile Detail & Search Controller */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="text-[#FF6B4A] font-mono text-sm tracking-widest uppercase font-bold flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
                Live Sync Dashboard
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                GitHub Dynamic Profiles
              </h2>
              <p className="text-[#BFC8D6] text-xs sm:text-sm leading-relaxed">
                Connect and scan real-time contribution metrics through our server proxy. By default, it features Ravi’s official developer telemetry, but you can sync any custom public GitHub account below.
              </p>

              {/* Dynamic Search Box */}
              <form onSubmit={(e: FormEvent) => {
                e.preventDefault();
                if (!searchUsernameInput.trim()) return;
                setGithubUsername(searchUsernameInput.trim());
                triggerSystemAlert(`Initiating SSH profile scan for @${searchUsernameInput.trim()}`);
              }} className="flex items-center gap-2.5 bg-white/[0.02] border border-white/10 rounded-xl p-1.5 focus-within:border-[#FF6B4A] transition-colors">
                <div className="flex-1 flex items-center gap-2 pl-3">
                  <span className="text-[#7A8799] font-mono text-xs">@</span>
                  <input
                    type="text"
                    value={searchUsernameInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchUsernameInput(e.target.value)}
                    placeholder="Enter github username"
                    className="w-full bg-transparent text-xs text-white placeholder:text-[#5B687C] focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={githubLoading}
                  className="px-4 py-2.5 bg-[#FF6B4A] hover:bg-[#FF7B54] text-white text-xs font-mono font-bold rounded-lg transition-all cursor-pointer disabled:opacity-40"
                >
                  {githubLoading ? "Loading..." : "Sync Profile"}
                </button>
              </form>

              {/* Dynamic Verification Badge */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-mono text-[#BFC8D6]">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>SSH Credentials Authorization: Secure</span>
                </div>
                {githubData?.isMock && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex gap-2.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span><b>Server Cache Notice:</b> Simulated fallback metrics (Official GitHub request cap reached or offline).</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Summary Details Card */}
            {githubData && (
              <div className="p-5 rounded-2xl bg-[#0D1B2A] border border-white/10 flex items-center gap-4 transition-all">
                <img
                  src={githubData.user.avatarUrl}
                  alt={githubData.user.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl border border-white/10 shadow-lg object-cover"
                  onError={(e) => {
                    // Fallback avatar if error
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe-profile`;
                  }}
                />
                <div className="text-left flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{githubData.user.name}</h4>
                  <p className="text-[11px] font-mono text-[#FF7B54] truncate">github.com/{githubData.user.username}</p>
                  <p className="text-[11px] text-[#7A8799] mt-1 truncate italic font-poppins">"{githubData.user.bio}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Visualization Grid of contribution days */}
          <div className="w-full lg:w-1/2">
            <div className="rounded-2xl bg-[#0D1B2A] border border-white/10 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
              
              {/* Header Tab toggles */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6 flex-wrap gap-3">
                <span className="text-xs text-[#BFC8D6] font-mono flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                  {githubLoading ? "Establishing dynamic fetch..." : "Sync status: 200 OK"}
                </span>
                
                <div className="flex items-center gap-1.5 bg-black/35 rounded-xl p-1 self-end font-mono">
                  <button
                    onClick={() => setActiveTab("heatmap")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === "heatmap" ? "bg-[#FF6B4A]/15 text-[#FF6B4A] border border-[#FF6B4A]/30" : "text-[#7A8799] hover:text-[#BFC8D6]"
                    }`}
                  >
                    Heatmap Grid
                  </button>
                  <button
                    onClick={() => setActiveTab("chart")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === "chart" ? "bg-[#FF6B4A]/15 text-[#FF6B4A] border border-[#FF6B4A]/30" : "text-[#7A8799] hover:text-[#BFC8D6]"
                    }`}
                  >
                    Trend Chart
                  </button>
                </div>
              </div>

              {/* Main content viewport */}
              {githubLoading || !githubData ? (
                /* Loading skeletons */
                <div className="flex-1 flex flex-col justify-center py-12 space-y-4">
                  <div className="w-1/3 h-4 bg-white/5 rounded-full animate-pulse" />
                  <div className="w-full h-24 bg-white/5 rounded-2xl animate-pulse" />
                  <div className="w-2/3 h-4 bg-white/5 rounded-full animate-pulse" />
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  
                  {/* Commits count row */}
                  <div className="flex justify-between items-center text-xs font-mono text-[#BFC8D6]">
                    <span>Total Activity: <strong className="text-white font-mono">{githubData.periodCommitSum} commits</strong></span>
                    <span className="text-[10px] text-[#7A8799]">Last 140 Days (20 weeks)</span>
                  </div>

                  {/* Rendering Tab Views */}
                  {activeTab === "heatmap" ? (
                    /* Heatmap grid rendering */
                    <div className="space-y-4">
                      {/* Day of week labels layout wrapper */}
                      <div className="flex gap-2">
                        {/* Days of week */}
                        <div className="grid grid-rows-7 text-[9px] font-mono text-[#5B687C] justify-between h-32 pr-1.5 select-none pt-1">
                          <span>Su</span>
                          <span>Mo</span>
                          <span>Tu</span>
                          <span>We</span>
                          <span>Th</span>
                          <span>Fr</span>
                          <span>Sa</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="grid grid-flow-col grid-rows-7 gap-1.5 p-2 bg-black/25 rounded-xl overflow-x-auto min-w-[280px] h-32">
                            {githubData.activity.map((day: any) => {
                              let bgColor = "bg-white/5";
                              if (day.count === 1) bgColor = "bg-green-500/10 border border-green-500/5";
                              else if (day.count === 2) bgColor = "bg-[#FF6B4A]/25 border border-[#FF6B4A]/10";
                              else if (day.count === 3) bgColor = "bg-[#FF6B4A]/45 border border-[#FF6B4A]/20";
                              else if (day.count > 3) bgColor = "bg-[#FF6B4A] shadow-md shadow-[#FF6B4A]/10";

                              return (
                                <div
                                  key={day.date}
                                  className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 duration-100 cursor-pointer group relative ${bgColor}`}
                                >
                                  {/* Tooltip content rendering */}
                                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#0D1B2A] border border-[#FF6B4A]/20 p-2 rounded-lg text-[9px] font-mono text-[#BFC8D6] whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                    <span className="font-bold text-white block">
                                      {new Date(day.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="text-[#FF7B54]">{day.count} {day.count === 1 ? 'contribution' : 'contributions'}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Less/More labels indicator */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#7A8799]">
                        <span>Less intensive commits</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-xs bg-white/5" />
                          <div className="w-2.5 h-2.5 rounded-xs bg-green-500/20" />
                          <div className="w-2.5 h-2.5 rounded-xs bg-[#FF6B4A]/25" />
                          <div className="w-2.5 h-2.5 rounded-xs bg-[#FF6B4A]/55" />
                          <div className="w-2.5 h-2.5 rounded-xs bg-[#FF6B4A]" />
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Area Chart rendering via Recharts */
                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={githubData.activity} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF6B4A" stopOpacity={0.6}/>
                              <stop offset="95%" stopColor="#FF6B4A" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="date" 
                            stroke="#5B687C" 
                            fontSize={9} 
                            tickLine={false}
                            tickFormatter={(str) => {
                              try {
                                const d = new Date(str);
                                return d.getDate() === 1 || d.getDate() === 15 ? d.toLocaleDateString([], { month: "short", day: "numeric" }) : "";
                              } catch(e) { return "" }
                            }}
                          />
                          <YAxis stroke="#5B687C" fontSize={9} width={30} tickLine={false} />
                          <ChartTooltip
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-[#0D1B2A] border border-[#FF6B4A]/30 p-2 rounded-lg text-[10px] font-mono shadow-2xl text-left">
                                    <p className="text-white/60 text-[9px]">{payload[0].payload.date}</p>
                                    <p className="text-white font-bold mt-0.5">
                                      Commits: <span className="text-[#FF6B4A]">{payload[0].value}</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="count" 
                            stroke="#FF6B4A" 
                            strokeWidth={1.5}
                            fillOpacity={1} 
                            fill="url(#colorCommits)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Developer Recent Commit Messages logs Stream */}
                  {githubData.recentCommits && githubData.recentCommits.length > 0 && (
                    <div className="border-t border-white/5 pt-4 text-left">
                      <span className="block text-[10px] font-mono font-bold text-[#FF7B54] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        SSH Secure Commit Logs Stream
                      </span>
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {githubData.recentCommits.map((cmt: any, cIdx: number) => (
                          <div key={cIdx} className="flex items-center justify-between gap-3 text-[10px] font-mono bg-black/15 p-1.5 px-2.5 rounded border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-green-500">✔</span>
                              <span className="text-white/40 font-mono select-all">[{cmt.sha}]</span>
                              <p className="text-[#BFC8D6] truncate">{cmt.message}</p>
                            </div>
                            <span className="text-[9px] text-[#7A8799] shrink-0 font-mono truncate max-w-[110px]">{cmt.repoName.split("/").pop()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic user statistics badge row */}
                  <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-black/15 hover:bg-black/25 transition-colors group">
                      <span className="block text-xl font-bold text-white font-mono group-hover:scale-105 transition-transform">{githubData.user.publicRepos}</span>
                      <span className="text-[9px] text-[#7A8799] uppercase font-mono tracking-wider">Repositories</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/15 hover:bg-black/25 transition-colors group">
                      <span className="block text-xl font-bold text-white font-mono group-hover:scale-105 transition-transform">{githubData.user.totalStars}</span>
                      <span className="text-[9px] text-[#7A8799] uppercase font-mono tracking-wider">Total Stars</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/15 hover:bg-black/25 transition-colors group">
                      <span className="block text-xl font-bold text-white font-mono group-hover:scale-105 transition-transform">{githubData.user.followers}</span>
                      <span className="text-[9px] text-[#7A8799] uppercase font-mono tracking-wider">Followers</span>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="py-24 bg-[#0D1B2A]/40 border-y border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 text-left">
          
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="text-[#FF6B4A] font-mono text-sm tracking-widest uppercase mb-3 font-bold flex items-center justify-center gap-2">
              <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
              Recruiter & Mentor Testimonials
              <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Endorsements & Feedbacks
            </h2>
            <p className="text-[#BFC8D6] text-base md:text-lg">
              Check out genuine remarks given during mock evaluations and active code review sprints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div 
                key={t.id}
                className="rounded-2xl p-6 bg-white/[0.03] border border-white/10 flex flex-col justify-between hover:border-white/15 transition-all shadow-xl glass-panel relative"
              >
                {/* Quotation mark decoration */}
                <span className="absolute top-4 right-6 text-6xl text-white/[0.02] font-serif select-none font-black pointer-events-none">
                  “
                </span>

                <div>
                  <div className="flex gap-1.5 mb-4 text-[#FF6B4A]">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-sm text-[#BFC8D6] leading-relaxed mb-6 font-poppins italic">
                    "{t.review}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 border-t border-white/5 pt-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF6B4A] to-[#FF7B54] flex items-center justify-center text-white font-bold font-mono text-sm uppercase">
                    {t.avatarSeed.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{t.name}</h4>
                    <span className="text-[11px] font-mono text-[#7A8799]">
                      {t.position}, {t.company}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CERTIFICATION BADGES SECTION */}
      <section id="certifications" className="py-24 max-w-[1400px] mx-auto px-6 sm:px-12 scroll-mt-20 border-t border-white/5 bg-[#0D1B2A]/20">
        <div className="text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="text-[#FF6B4A] font-mono text-sm tracking-widest uppercase mb-3 font-bold flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
              Verified Credentials
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Certification Badges
            </h2>
            <p className="text-[#BFC8D6] text-base md:text-lg">
              Independently verified skills and specialization paths completed across leading cloud and online classrooms.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CERTIFICATIONS.map((cert) => {
            // Pick a badge accent color based on platform
            let platformColor = "from-[#FF6B4A]/10 to-[#FF7B54]/2 border-[#FF6B4A]/20 text-[#FF7B54]";
            let badgeBg = "bg-[#FF6B4A]/10 text-[#FF7B54]";
            if (cert.platform === "AWS") {
              platformColor = "from-amber-500/10 to-amber-600/2 border-amber-500/20 text-amber-400";
              badgeBg = "bg-amber-500/10 text-amber-400";
            } else if (cert.platform === "freeCodeCamp") {
              platformColor = "from-emerald-500/10 to-emerald-600/2 border-emerald-500/20 text-emerald-400";
              badgeBg = "bg-emerald-500/10 text-emerald-400";
            } else if (cert.platform === "Coursera") {
              platformColor = "from-blue-500/10 to-blue-600/2 border-blue-500/20 text-blue-400";
              badgeBg = "bg-blue-500/10 text-blue-400";
            } else if (cert.platform === "Google") {
              platformColor = "from-cyan-500/10 to-cyan-600/2 border-cyan-500/20 text-cyan-400";
              badgeBg = "bg-cyan-500/10 text-cyan-400";
            }

            return (
              <div 
                key={cert.id}
                className={`relative rounded-2xl border bg-gradient-to-br ${platformColor} p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-300 shadow-xl group`}
              >
                {/* Visual upper badge indicator */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${badgeBg} border border-white/5`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#BFC8D6]/80 font-bold bg-white/5 py-1 px-2.5 rounded-full border border-white/5">
                    {cert.platform}
                  </span>
                </div>

                {/* Content info */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#FF7B54] transition-colors mb-2 leading-snug line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-[#7A8799] mb-4 font-mono">
                    Issuer: {cert.issuer}
                  </p>

                  {/* Skills lists */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {cert.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="text-[9px] font-mono text-[#BFC8D6] bg-white/[0.03] px-2 py-1 rounded border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer specs */}
                <div className="pt-4 border-t border-white/5 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                    <span>ID: {cert.credentialId}</span>
                    <span>{cert.date}</span>
                  </div>

                  {cert.verificationUrl && (
                    <a 
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono font-bold text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
                      Verify Credential
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT SECTION & LEAVE MESSAGE WORKSPACE LOGS */}
      <section id="contact" className="py-24 max-w-[1400px] mx-auto px-6 sm:px-12 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Left Column */}
          <div className="lg:col-span-4 text-left space-y-6 flex flex-col justify-between">
            <div>
              <div className="text-[#FF6B4A] font-mono text-sm tracking-widest uppercase font-bold flex items-center gap-2 mb-3">
                <span className="w-6 h-0.5 bg-[#FF6B4A] block"></span>
                Secure Port Socket
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-6">
                Let's Build Something Amazing.
              </h2>
              <p className="text-[#BFC8D6] text-base leading-relaxed">
                Thank you for reviewing my personal coding portfolio! Please send in custom messages, meeting schedules, or project evaluations through the portal.
              </p>
            </div>

            {/* Direct Contact Coordinates */}
            <div className="space-y-4">
              <a 
                href="mailto:ravimalakar091@gmail.com" 
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#FF6B4A]/20 hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#FF6B4A] group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs uppercase text-[#7A8799] font-mono font-bold tracking-wider">Email Direct</span>
                  <span className="text-sm text-white font-mono font-medium">ravimalakar091@gmail.com</span>
                </div>
              </a>

              <a 
                href="https://www.linkedin.com/in/ravi-mali-dev" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#FF6B4A]/20 hover:bg-white/[0.04] transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#FF6B4A] group-hover:scale-105 transition-transform">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs uppercase text-[#7A8799] font-mono font-bold tracking-wider">LinkedIn Gateway</span>
                  <span className="text-sm text-white font-mono font-medium">Ravi Mali Connections</span>
                </div>
              </a>
            </div>

            {/* Social icons bottom */}
            <div>
              <p className="text-xs uppercase text-[#7A8799] font-mono font-bold tracking-widest mb-3">
                Social Coordinates
              </p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com/ravimali-dev" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-3 bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl text-[#BFC8D6] hover:text-white transition-all cursor-pointer"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/ravi-mali-dev" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-3 bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl text-[#BFC8D6] hover:text-white transition-all cursor-pointer"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="p-3 bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl text-[#BFC8D6] hover:text-white transition-all cursor-pointer"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>

          {/* Contact Right Column: Submission Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl bg-[#0D1B2A] border border-white/10 p-6 md:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <span className="text-xs text-[#BFC8D6] font-mono uppercase tracking-widest flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-[#FF6B4A]" />
                  Recruiter visitor form
                </span>
                <span className="text-xs text-[#7A8799] font-mono">Secure DB Endpoint</span>
              </div>

              {submitSuccess ? (
                <div className="py-12 px-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Your message was stored on Express server!</h3>
                  <p className="text-sm text-[#BFC8D6] max-w-md mx-auto">
                    The filesystem record was successfully written to <code className="bg-black/45 px-1.5 py-0.5 rounded text-red-400 font-mono">messages.json</code> on the sandbox. Recruiters can view live telemetry data stream below.
                  </p>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-4 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[#FF6B4A] rounded-xl text-xs font-mono font-bold cursor-pointer"
                  >
                    Send Another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-medium text-[#BFC8D6]">Hiring representative name *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Ms. Jane Recruiter"
                        className="w-full bg-black/25 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF6B4A] focus:outline-none transition-all placeholder:text-[#7A8799]"
                      />
                      {formErrors.name && <p className="text-xs text-[#FF6B4A] font-mono mt-1">{formErrors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-medium text-[#BFC8D6]">Contact Email Address *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. hiring@agency.com"
                        className="w-full bg-black/25 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF6B4A] focus:outline-none transition-all placeholder:text-[#7A8799]"
                      />
                      {formErrors.email && <p className="text-xs text-[#FF6B4A] font-mono mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-[#BFC8D6]">Subject heading *</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Internship Interview Summer 2026 / Collaborative Freelance"
                      className="w-full bg-black/25 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF6B4A] focus:outline-none transition-all placeholder:text-[#7A8799]"
                    />
                    {formErrors.subject && <p className="text-xs text-[#FF6B4A] font-mono mt-1">{formErrors.subject}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium text-[#BFC8D6]">Meeting / Inquire Message *</label>
                    <textarea 
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Write your comprehensive subject proposal details or meeting timelines here..."
                      className="w-full bg-black/25 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF6B4A] focus:outline-none transition-all placeholder:text-[#7A8799] resize-none"
                    />
                    {formErrors.message && <p className="text-xs text-[#FF6B4A] font-mono mt-1">{formErrors.message}</p>}
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#FF6B4A] hover:bg-[#FF7B54] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#FF6B4A]/10 hover:shadow-[#FF6B4A]/20 cursor-pointer disabled:opacity-50 select-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Writing database entry...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Store visitor Message on Server DB
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Recruiter Logs Proof representation (Express file list) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4.5 h-4.5 text-[#FF6B4A]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Express Server persisted Records ({recruiterMessages.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setShowRecruiterLogs(!showRecruiterLogs);
                      triggerSystemAlert(showRecruiterLogs ? "Inbox preview hidden" : "Loaded Express database audit view");
                    }}
                    className="text-xs text-[#FF6B4A] hover:underline cursor-pointer font-mono"
                  >
                    {showRecruiterLogs ? "Collapse audit view" : "Expand audit view"}
                  </button>
                  {recruiterMessages.length > 0 && (
                    <button 
                      onClick={handleClearInbox}
                      className="p-1 px-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-mono transition-all cursor-pointer"
                      title="Clear JSON Database"
                    >
                      Clear DB
                    </button>
                  )}
                </div>
              </div>

              {showRecruiterLogs && (
                <div className="mt-4 space-y-3.5 max-h-64 overflow-y-auto pr-1">
                  {recruiterMessages.length === 0 ? (
                    <p className="text-xs text-[#7A8799] font-mono italic">
                      No records saved yet. Submit a message above to write onto messages.json instantly!
                    </p>
                  ) : (
                    recruiterMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className="p-4 rounded-xl bg-black/35 border border-white/5 text-xs text-[#BFC8D6] space-y-2 relative"
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono text-[#7A8799]">
                          <span className="text-white font-bold">{msg.name} ({msg.email})</span>
                          <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white font-medium font-poppins text-xs">
                          Sub: {msg.subject}
                        </p>
                        <p className="text-[#7A8799] pl-2 border-l border-white/10 italic">
                          "{msg.message}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="h-16 px-6 sm:px-12 flex flex-col md:flex-row items-center justify-between border-t border-white/10 bg-[#0D1B2A]">
        <span className="text-[10px] text-[#7A8799] uppercase tracking-widest font-mono">
          © 2026 Ravi Mali. All Rights Reserved. • Designed with premium glassmorphism
        </span>
        <div className="flex items-center space-x-6 mt-3 md:mt-0">
          <div className="text-[10px] flex items-center text-[#BFC8D6] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Gemini Brokering Systems Operational
          </div>
        </div>
      </footer>

      {/* DYNAMIC SIDE GLOW OVERLAYS */}
      <div className="absolute top-[1800px] right-0 w-96 h-96 bg-[#FF6B4A]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-80 h-80 bg-[#FF6B4A]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* THE AI TWIN DRAWER BUTTON OR CHAT CLIENT EXPANDED */}
      {isAssistantOpen ? (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0D1B2A] border-l border-white/10 shadow-2xl z-50 flex flex-col justify-between transform transition-transform duration-300 animate-slide-in">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#101D2E] to-[#07131F] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF7B54] flex items-center justify-center relative">
                <Cpu className="text-white w-4.5 h-4.5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-black" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold text-white tracking-tight">Ravi's AI Representative</span>
                <span className="block text-[10px] text-[#FF7B54] font-mono tracking-wider">GEMINI FLASH BROADCAST</span>
              </div>
            </div>
            
            <button
              onClick={() => setIsAssistantOpen(false)}
              className="p-2 rounded-lg bg-white/[0.05] text-[#BFC8D6] hover:text-white transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick-tips banner */}
          <div className="p-3 bg-white/[0.02] border-b border-white/5 text-left flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#7A8799] font-mono leading-relaxed">
              Ask about Ravi's <b>TechNova role</b>, frontend skill weights, <b>Express backend configurations</b>, or project links directly!
            </p>
          </div>

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#07131F]/90">
            {chatHistory.map((item, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-4.5 text-xs text-left leading-relaxed ${
                    item.role === 'user' 
                      ? 'bg-[#FF6B4A] text-white rounded-tr-none shadow-md shadow-[#FF6B4A]/10' 
                      : 'bg-[#0D1B2A] border border-white/10 text-[#BFC8D6] rounded-tl-none font-poppins shadow-xl'
                  } space-y-2`}
                >
                  {/* Simplistic custom markdown bold parsing for clean UI layout */}
                  <p className="whitespace-pre-line">
                    {item.text.split("**").map((textBlock, idx) => 
                      idx % 2 === 1 ? <strong key={idx} className="font-bold text-white">{textBlock}</strong> : textBlock
                    )}
                  </p>
                  
                  <span className={`block text-[8px] font-mono ${item.role === 'user' ? 'text-white/70 text-right' : 'text-[#7A8799]'}`}>
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-[#0D1B2A] border border-white/10 rounded-2xl rounded-tl-none p-4.5 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] text-[#7A8799] font-mono">Agent analyzing query...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Form input field */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 bg-gradient-to-t from-[#101D2E] to-[#07131F] border-t border-white/10 flex items-center gap-2"
          >
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Ravi's representative twins anything..."
              disabled={chatLoading}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-[#FF6B4A] focus:outline-none transition-colors text-white placeholder:text-[#5B687C]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="p-3 bg-[#FF6B4A] hover:bg-[#FF7B54] text-white rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-30"
              title="Send message"
            >
              <SendHorizonal className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : (
        /* Floating mini launcher icon matching beautiful visuals */
        <button
          onClick={() => {
            setIsAssistantOpen(true);
            triggerSystemAlert("Connected with Ravi's Representative AI Twin!");
          }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF7B54] flex items-center justify-center text-white shadow-2xl shadow-[#FF6B4A]/30 cursor-pointer hover:scale-105 transition-all outline-none"
          title="Talk to AI"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
        </button>
      )}

    </div>
  );
}
