export interface Skill {
  name: string;
  level: number; // 0-100 progress indicator
  iconName: string;
}

export interface SkillCategory {
  title: string;
  skills: Skill[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tech: string[];
  image: string; // custom gradient background patterns or generated assets
  liveUrl: string;
  githubUrl: string;
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  responsibilities: string[];
  learningJourney: string[];
  techUsed: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  avatarSeed: string; // seed for elegant initial avatar
  review: string;
  rating: number;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessageLog {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  platform: "Coursera" | "freeCodeCamp" | "AWS" | "Google" | "Meta";
  date: string;
  credentialId: string;
  skills: string[];
  verificationUrl?: string;
}

