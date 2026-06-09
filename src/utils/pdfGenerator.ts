import { jsPDF } from "jspdf";

export interface GenerateResumeOptions {
  username?: string;
  email?: string;
}

export function generateResumePdf(options: GenerateResumeOptions = {}): void {
  const name = "Ravi Mali";
  const title = "BCA Student | Frontend Developer | React.js & JavaScript";
  const phone = "9887050594";
  const email = options.email || "ravimalakar091@gmail.com";
  const github = `github.com/${options.username || "ravimali-dev"}`;
  const linkedin = "linkedin.com/in/ravi-mali-dev";
  const location = "Jaipur, India";

  // Create document in Letter format, working in points (72 points = 1 inch)
  // Letter size is 612 x 792 pt
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  // Color Palette
  const colors = {
    primary: [255, 107, 74] as [number, number, number], // #FF6B4A
    darkText: [15, 23, 42] as [number, number, number],   // #0F172A
    mutedText: [71, 85, 105] as [number, number, number], // #475569
    lightGray: [226, 232, 240] as [number, number, number] // #E2E8F0
  };

  // Helper properties
  const margin = 45;
  const contentWidth = 522; // 612 - 45*2
  let currentY = 50;

  // Type helper for drawing text
  const text = (str: string, x: number, y: number, textOpts: {
    fontSize?: number;
    fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
    color?: [number, number, number];
    align?: "left" | "center" | "right";
  } = {}) => {
    if (textOpts.fontSize) doc.setFontSize(textOpts.fontSize);
    doc.setFont("helvetica", textOpts.fontStyle || "normal");
    doc.setTextColor(textOpts.color?.[0] ?? colors.darkText[0], textOpts.color?.[1] ?? colors.darkText[1], textOpts.color?.[2] ?? colors.darkText[2]);
    doc.text(str, x, y, { align: textOpts.align || "left" });
  };

  // Draw Header Section
  text(name, 306, currentY, { fontSize: 24, fontStyle: "bold", color: colors.darkText, align: "center" });
  currentY += 18;

  text(title, 306, currentY, { fontSize: 10, fontStyle: "italic", color: colors.mutedText, align: "center" });
  currentY += 16;

  // Contact Info row
  const contactStr = ` ${phone}  |  ${email}  |  LinkedIn  |  GitHub: ${github}  |  ${location}`;
  text(contactStr, 306, currentY, { fontSize: 8.5, fontStyle: "normal", color: colors.mutedText, align: "center" });
  currentY += 15;

  // Brand line separation
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(1.5);
  doc.line(margin, currentY, 612 - margin, currentY);
  currentY += 20;

  // SECTION HELPER
  const drawSectionHeader = (titleText: string) => {
    currentY += 8;
    text(titleText, margin, currentY, { fontSize: 11, fontStyle: "bold", color: colors.darkText });
    
    // Thin baseline below heading
    currentY += 4;
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(1);
    doc.line(margin, currentY, 612 - margin, currentY);
    currentY += 14;
  };

  // PROFESSIONAL SUMMARY
  drawSectionHeader("PROFESSIONAL SUMMARY");
  
  const summaryText = "Motivated BCA final-year student with practical experience building full-stack web applications. Proficient in HTML, CSS, JavaScript, and React. Has built and deployed real projects including a live video conferencing app, a blogging platform, and a personal portfolio. Seeking a remote web developer internship to contribute to real-world projects.";
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.darkText[0], colors.darkText[1], colors.darkText[2]);
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(splitSummary, margin, currentY);
  currentY += splitSummary.length * 12 + 10;

  // EDUCATION SECTION
  drawSectionHeader("EDUCATION");
  text("Apex University | Jaipur, India", margin, currentY, { fontSize: 10, fontStyle: "bold", color: colors.darkText });
  text("2023 - 2026", 612 - margin, currentY, { fontSize: 9, fontStyle: "bold", color: colors.mutedText, align: "right" });
  currentY += 12;
  text("Bachelor of Computer Applications (BCA)", margin, currentY, { fontSize: 9.5, fontStyle: "italic", color: colors.primary });
  text("CGPA : 7.5", 612 - margin, currentY, { fontSize: 9.5, fontStyle: "bold", color: colors.darkText, align: "right" });
  currentY += 14;

  const educationText = "Established a robust foundation in computer science, programming, database management, web development, and software engineering principles.";
  const splitEdu = doc.splitTextToSize(educationText, contentWidth);
  doc.text(splitEdu, margin, currentY);
  currentY += splitEdu.length * 11 + 10;

  // PROJECTS SECTION
  drawSectionHeader("PROJECTS");

  // Project 1: Live Video Conferencing
  text("Live Video Conferencing and Chat Web Application", margin, currentY, { fontSize: 10, fontStyle: "bold", color: colors.darkText });
  text("Lead Developer | Website | GitHub", 612 - margin, currentY, { fontSize: 8.5, fontStyle: "bold", color: colors.primary, align: "right" });
  currentY += 12;

  const proj1Points = [
    "Designed and developed a Live Video Conferencing and Chat Web Application to enhance virtual communication capabilities.",
    "Employed modern web technologies to deliver a seamless user experience.",
    "Collaborated with cross-functional teams to integrate key features and optimize performance.",
    "Technologies / Tools Used: React, Node.js, Express, MongoDB, Tailwind CSS"
  ];

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  proj1Points.forEach((point) => {
    doc.text("•", margin + 4, currentY + 1);
    const splitPoint = doc.splitTextToSize(point, contentWidth - 16);
    doc.text(splitPoint, margin + 14, currentY);
    currentY += splitPoint.length * 11 + 2;
  });
  currentY += 10;

  // Project 2: Blogify
  text("Blogify", margin, currentY, { fontSize: 10, fontStyle: "bold", color: colors.darkText });
  text("GitHub", 612 - margin, currentY, { fontSize: 8.5, fontStyle: "bold", color: colors.primary, align: "right" });
  currentY += 12;

  const proj2Points = [
    "Developed a full-stack blogging application that allows users to create, edit, publish, and manage blog posts through a modern, responsive interface.",
    "Implemented secure user authentication for login, signup, and session management using Appwrite.",
    "Built reusable React components and crafted a clean user experience with Tailwind CSS.",
    "Technologies / Tools Used: React, Tailwind CSS"
  ];

  proj2Points.forEach((point) => {
    doc.text("•", margin + 4, currentY + 1);
    const splitPoint = doc.splitTextToSize(point, contentWidth - 16);
    doc.text(splitPoint, margin + 14, currentY);
    currentY += splitPoint.length * 11 + 2;
  });
  currentY += 10;

  // SKILLS SECTION
  drawSectionHeader("SKILLS");

  const skillsData = [
    { label: "Programming Languages :", val: "JavaScript, TypeScript" },
    { label: "Frameworks & Libraries :", val: "React, Express, Node.js" },
    { label: "Tools & Platforms :", val: "Git, GitHub" },
    { label: "Databases :", val: "MongoDB, MySQL" },
    { label: "Soft Skills :", val: "Problem Solving, Collaboration" },
    { label: "Languages :", val: "Hindi, English" }
  ];

  skillsData.forEach((s) => {
    text(s.label, margin, currentY, { fontSize: 9, fontStyle: "bold", color: colors.darkText });
    const labelW = doc.getTextWidth(s.label);
    text(s.val, margin + labelW + 10, currentY, { fontSize: 9, fontStyle: "normal", color: colors.mutedText });
    currentY += 12;
  });

  // Save the PDF
  doc.save(`${name.replace(/\s+/g, "_")}_Resume.pdf`);
}
