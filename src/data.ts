import { SkillCategory, Project, Experience, Testimonial, Certification } from "./types";

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Frontend Development",
    skills: [
      { name: "React / React 19", level: 95, iconName: "Code" },
      { name: "JavaScript (ES6+)", level: 92, iconName: "Cpu" },
      { name: "Tailwind CSS v4 & Motion", level: 90, iconName: "Palette" },
      { name: "HTML5", level: 95, iconName: "Layout" },
      { name: "CSS3 & Glassmorphism", level: 88, iconName: "Sparkles" },
    ],
  },
  {
    title: "Backend Engineering",
    skills: [
      { name: "Node.js", level: 80, iconName: "Server" },
      { name: "Express.js", level: 85, iconName: "ShieldAlert" },
    ],
  },
  {
    title: "Database Systems",
    skills: [
      { name: "MongoDB", level: 75, iconName: "Database" },
      { name: "MySQL", level: 78, iconName: "Layers" },
    ],
  },
  {
    title: "Tools & Deployments",
    skills: [
      { name: "Git & GitHub", level: 88, iconName: "GitBranch" },
      { name: "VS Code", level: 95, iconName: "Terminal" },
      { name: "Postman", level: 86, iconName: "Send" },
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    id: "videoconf",
    title: "Live Video Conferencing & Chat App",
    description: "Designed and developed an immersive video communicating environment supporting web RTC flows, messaging hubs, and seamless screen sharing capabilities.",
    longDescription: "A modern video conferencing experience designed to enhance virtual communication capabilities, built with high-fidelity React controls, Node.js/Express, and MongoDB storage.",
    tech: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
    image: "linear-gradient(135deg, #FF6B4A 0%, #101D2E 100%)",
    liveUrl: "https://github.com/ravimali-dev/Minor-Project",
    githubUrl: "https://github.com/ravimali-dev/Minor-Project",
  },
  {
    id: "blogify",
    title: "Blogify: Modern Blogging Platform",
    description: "A full-stack blogging web application enabling readers to create, edit, publish, and manage blog posts through a highly responsive dashboard workspace.",
    longDescription: "Features premium glassmorphic list components, secure user authentication (login, signup, session tokens) using Appwrite SDK endpoints, and streamlined Tailwind styles.",
    tech: ["React", "Tailwind CSS", "Appwrite", "JavaScript"],
    image: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
    liveUrl: "https://github.com/ravimali-dev/Blogify",
    githubUrl: "https://github.com/ravimali-dev/Blogify",
  },
  {
    id: "portfolio",
    title: "Interactive AI-Twin Developer Portfolio",
    description: "Futuristic dark-themed portfolio website with dynamic scroll indicators, a server-side persisted contact database, and a custom Gemini-powered AI twin assistant for recruiters.",
    longDescription: "A fully full-stack developer portfolio implementing real-time communications, stateful glassmorphic controls, interactive counters, and custom animated scroll timeline layouts.",
    tech: ["React", "Express.js", "Gemini 3.5", "Tailwind CSS", "Motion"],
    image: "linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)",
    liveUrl: "#",
    githubUrl: "https://github.com/ravimali-dev/interactive-portfolio",
  },
];

export const EXPERIENCE_TIMELINE: Experience[] = [
  {
    role: "Bachelor of Computer Applications (BCA)",
    company: "Apex University | Jaipur, India",
    duration: "2023 - 2026 • CGPA: 7.5",
    responsibilities: [
      "Established a robust foundation in computer science, programming, database management, web development, and software engineering principles.",
      "Engaged in building highly interactive and practical full-stack projects including live video workspaces, messaging portals, and blogging tools.",
      "Excelled in academic subjects: Data Structures & Algorithms, Object-Oriented Programming (OOPs), Web Architectures, and Database Systems."
    ],
    learningJourney: [
      "Studying modern web standards including React, Node.js, and client state orchestration.",
      "Mastering relational (MySQL) and non-relational (MongoDB) database design paradigms."
    ],
    techUsed: ["JavaScript", "TypeScript", "React", "Express", "Node.js", "MongoDB", "MySQL", "Git", "GitHub"]
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah Jenkins",
    position: "Senior Tech Recruiter",
    company: "FutureScale Ventures",
    avatarSeed: "sarah",
    review: "Ravi is exactly the type of developer recruiters dream of finding. His attention to detail, polished portfolios, and mastery of responsive frontend frameworks make him stand out immediately. Truly impressive full-stack potential!",
    rating: 5,
  },
  {
    id: "t2",
    name: "Anand Mehta",
    position: "Lead Engineering Architect",
    company: "Synergetic Solutions",
    avatarSeed: "anand",
    review: "When Ravi joined our group during our open source sprints, his clean architectural divisions and use of modular React component trees showed code discipline far beyond his years. He communicates clearly and writes secure, fast code.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Marcus Aurelius",
    position: "Founder & CTO",
    company: "Stoic Labs",
    avatarSeed: "marcus",
    review: "Ravi's interactive systems are beautifully customized. His portfolio website is a work of art—mixing modern glassmorphism buttons, rich floating animations, and solid backend AI features flawlessly. Hire him before someone else does!",
    rating: 5,
  },
];

export const CERTIFICATIONS: Certification[] = [
  {
    id: "cert-aws",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services (AWS)",
    platform: "AWS",
    date: "Jan 2025",
    credentialId: "AWS-CCP-998822",
    skills: ["Cloud Computing", "AWS Security", "Cloud Architecture", "Core Services"],
    verificationUrl: "https://aws.amazon.com/verification",
  },
  {
    id: "cert-fb",
    title: "React Web Development & State Orchestration",
    issuer: "University of Science & Tech (via Coursera)",
    platform: "Coursera",
    date: "Nov 2024",
    credentialId: "COURSERA-RE-8531A",
    skills: ["React Hooks", "State Management", "Component Patterns", "D3 / Recharts"],
    verificationUrl: "https://coursera.org/verify/react-fullstack",
  },
  {
    id: "cert-fcc",
    title: "JavaScript Algorithms & Data Structures",
    issuer: "freeCodeCamp",
    platform: "freeCodeCamp",
    date: "Aug 2024",
    credentialId: "FCC-JS-774411",
    skills: ["JavaScript (ES6+)", "OOP", "Functional Programming", "Data Structures"],
    verificationUrl: "https://www.freecodecamp.org/certification/fcc-js",
  },
  {
    id: "cert-goog",
    title: "Google UX Design Professional Certificate",
    issuer: "Google",
    platform: "Google",
    date: "May 2024",
    credentialId: "GOOG-UXD-335591",
    skills: ["User Experience (UX)", "Figma", "Wireframing", "Responsive Interaction"],
    verificationUrl: "https://coursera.org/verify/googleux",
  }
];

