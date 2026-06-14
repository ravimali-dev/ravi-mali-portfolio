import { jsPDF } from "jspdf";

export function generateResumePdf(options = {}) {
  const name = "Ravi Mali";
  const title = "BCA Scholar | Frontend Developer | React.js & JavaScript Specialist";
  const phone = "+91 98870 50594";
  const email = options.email || "ravimalakar091@gmail.com";
  const github = `github.com/${options.username || "ravimali-dev"}`;
  const linkedin = "linkedin.com/in/ravi-mali-dev";
  const location = "Jaipur, India";

  // Create document in Letter format
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  // Color Palette
  const colors = {
    primary: [255, 107, 74], // #FF6B4A
    darkText: [15, 23, 42],   // #0F172A
    mutedText: [71, 85, 105], // #475569
    lightGray: [226, 232, 240] // #E2E8F0
  };

  // Helper properties
  const margin = 45;
  const contentWidth = 522; // 612 - 45*2
  let currentY = 45;

  // Helper for drawing text
  const text = (str, x, y, textOpts = {}) => {
    if (textOpts.fontSize) doc.setFontSize(textOpts.fontSize);
    doc.setFont("helvetica", textOpts.fontStyle || "normal");
    
    const r = textOpts.color ? textOpts.color[0] : colors.darkText[0];
    const g = textOpts.color ? textOpts.color[1] : colors.darkText[1];
    const b = textOpts.color ? textOpts.color[2] : colors.darkText[2];
    
    doc.setTextColor(r, g, b);
    doc.text(str, x, y, { align: textOpts.align || "left" });
  };

  // Draw Header Section (Centered & Premium)
  text(name, 306, currentY, { fontSize: 22, fontStyle: "bold", color: colors.darkText, align: "center" });
  currentY += 18;

  text(title, 306, currentY, { fontSize: 9.5, fontStyle: "italic", color: colors.primary, align: "center" });
  currentY += 16;

  // Contact Info row
  const contactStr1 = `${phone}   |   ${email}`;
  const contactStr2 = `GitHub: ${github}   |   LinkedIn: ${linkedin}   |   ${location}`;
  
  text(contactStr1, 306, currentY, { fontSize: 8.5, fontStyle: "normal", color: colors.mutedText, align: "center" });
  currentY += 12;

  text(contactStr2, 306, currentY, { fontSize: 8.5, fontStyle: "normal", color: colors.mutedText, align: "center" });
  currentY += 15;

  // Brand line separation
  doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setLineWidth(1.5);
  doc.line(margin, currentY, 612 - margin, currentY);
  currentY += 18;

  // SECTION HELPER
  const drawSectionHeader = (titleText) => {
    currentY += 12;
    text(titleText, margin, currentY, { fontSize: 10.5, fontStyle: "bold", color: colors.primary });
    
    // Thin baseline below heading
    currentY += 4;
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(1);
    doc.line(margin, currentY, 612 - margin, currentY);
    currentY += 12;
  };

  // 1. PROFESSIONAL SUMMARY
  drawSectionHeader("PROFESSIONAL SUMMARY");
  
  const summaryText = "Motivated BCA final-year scholar with practical experience in full-stack web applications and interactive client interfaces. Proficient in HTML5, CSS3, JavaScript (ES6+), React 18/19, and Tailwind CSS. Built high-fidelity real-world applications including a live video conferencing app, an Appwrite-integrated blogging platform, and a customized AI chatbot agent. Seeking a remote web developer internship or junior role to apply computer science principles and contribute clean, responsive codebase structures.";
  
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.darkText[0], colors.darkText[1], colors.darkText[2]);
  const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
  
  // Custom loop to render lines cleanly with modern paragraph spacing
  splitSummary.forEach((line) => {
    doc.text(line, margin, currentY);
    currentY += 11.5;
  });
  currentY += 4;

  // 2. CORE TECHNICAL SKILLS
  drawSectionHeader("TECHNICAL SKILLS");

  const skillsData = [
    { label: "FRONTEND ENGINEERING", val: "React, JavaScript (ES6+), Tailwind CSS v4, Motion" },
    { label: "BACKEND STRUCTURES", val: "Node.js, Express.js" },
    { label: "DATABASE SYSTEMS", val: "MongoDB, MySQL" },
    { label: "TOOLS & DEPLOYMENTS", val: "Git, GitHub, VS Code, Postman" },
    { label: "COMPUTER SCIENCE", val: "OOPs Fundamentals, DBMS, Data Structures" },
    { label: "SOFT SKILLS & LANGUAGE", val: "Problem Solving, Teamwork, English, Hindi" }
  ];

  for (let i = 0; i < skillsData.length; i += 2) {
    // Column 1
    text(skillsData[i].label + ":", margin, currentY, { fontSize: 8, fontStyle: "bold", color: colors.darkText });
    const labelW1 = doc.getTextWidth(skillsData[i].label + ": ");
    text(skillsData[i].val, margin + labelW1, currentY, { fontSize: 8, fontStyle: "normal", color: colors.mutedText });

    // Column 2
    if (skillsData[i+1]) {
      const col2X = margin + 265;
      text(skillsData[i+1].label + ":", col2X, currentY, { fontSize: 8, fontStyle: "bold", color: colors.darkText });
      const labelW2 = doc.getTextWidth(skillsData[i+1].label + ": ");
      text(skillsData[i+1].val, col2X + labelW2, currentY, { fontSize: 8, fontStyle: "normal", color: colors.mutedText });
    }
    currentY += 12;
  }
  currentY += 4;

  // 3. KEY PROJECTS
  drawSectionHeader("FEATURED PROJECTS");

  // Project 1
  text("Live Video Conferencing & Chat Web Application", margin, currentY, { fontSize: 9.5, fontStyle: "bold", color: colors.darkText });
  text("React, Node, Express, MongoDB, Tailwind CSS", 612 - margin, currentY, { fontSize: 8, fontStyle: "bold", color: colors.primary, align: "right" });
  currentY += 11;

  const proj1Points = [
    "Engineered an interactive real-time video conferencing web layout with flexible WebRTC connection structures.",
    "Built secure text communication channels complete with full-stack message logging and database state management.",
    "Integrated responsive interactive navigation and glassmorphism styling frameworks using custom Tailwind utilities."
  ];

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  proj1Points.forEach((point) => {
    doc.text("•", margin + 5, currentY + 0.5);
    const splitPoint = doc.splitTextToSize(point, contentWidth - 14);
    doc.text(splitPoint, margin + 14, currentY);
    currentY += splitPoint.length * 11 + 1.5;
  });
  currentY += 6;

  // Project 2
  text("Blogify: Modern Blogging Workspace", margin, currentY, { fontSize: 9.5, fontStyle: "bold", color: colors.darkText });
  text("React, Tailwind CSS, Appwrite BaaS, JavaScript", 612 - margin, currentY, { fontSize: 8, fontStyle: "bold", color: colors.primary, align: "right" });
  currentY += 11;

  const proj2Points = [
    "Developed a responsive blog publishing application letting creators draft, publish, and edit markdown content safely.",
    "Configured secure authentication flows (signup, login, and active tokens) using Appwrite SDK connections.",
    "Created modular React component trees to maintain optimized states, reducing unneeded document render iterations."
  ];

  proj2Points.forEach((point) => {
    doc.text("•", margin + 5, currentY + 0.5);
    const splitPoint = doc.splitTextToSize(point, contentWidth - 14);
    doc.text(splitPoint, margin + 14, currentY);
    currentY += splitPoint.length * 11 + 1.5;
  });
  currentY += 6;

  // Project 3
  text("Interactive AI-Twin Developer Portfolio", margin, currentY, { fontSize: 9.5, fontStyle: "bold", color: colors.darkText });
  text("React, Express.js, Gemini API, Tailwind, Motion", 612 - margin, currentY, { fontSize: 8, fontStyle: "bold", color: colors.primary, align: "right" });
  currentY += 11;

  const proj3Points = [
    "Designed a standard full-stack recruiter center presenting verified live GitHub activity heat maps on-the-fly.",
    "Created an Express.js backend server proxy to manage and deliver secure server-side Gemini 3.5 chat dialogues.",
    "Integrated custom interactive micro-animations with client-side index tracking and fluid transition effects."
  ];

  proj3Points.forEach((point) => {
    doc.text("•", margin + 5, currentY + 0.5);
    const splitPoint = doc.splitTextToSize(point, contentWidth - 14);
    doc.text(splitPoint, margin + 14, currentY);
    currentY += splitPoint.length * 11 + 1.5;
  });
  currentY += 4;

  // 4. EDUCATION
  drawSectionHeader("EDUCATION");
  text("Apex University | Jaipur, India", margin, currentY, { fontSize: 9.5, fontStyle: "bold", color: colors.darkText });
  text("2023 - 2026", 612 - margin, currentY, { fontSize: 8.5, fontStyle: "bold", color: colors.mutedText, align: "right" });
  currentY += 11;
  text("Bachelor of Computer Applications (BCA)", margin, currentY, { fontSize: 9, fontStyle: "italic", color: colors.primary });
  text("CGPA: 7.5 / 10", 612 - margin, currentY, { fontSize: 9, fontStyle: "bold", color: colors.darkText, align: "right" });
  currentY += 11;

  const educationText = "Core studies emphasize software principles, Advanced Programming Structures, Object Oriented Systems, database administration (SQL, MySQL), and modern responsive web systems architectures.";
  const splitEdu = doc.splitTextToSize(educationText, contentWidth);
  splitEdu.forEach((line) => {
    doc.text(line, margin, currentY);
    currentY += 11;
  });
  currentY += 6;

  // 5. OTHER / CERTIFICATIONS
  drawSectionHeader("CERTIFICATIONS & CREDENTIALS");

  const certifications = [
    { title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services (AWS)", code: "AWS-CCP-99" },
    { title: "React Web Development & States", issuer: "Coursera / Univ. of Science", code: "RE-85" },
    { title: "JavaScript Algorithms & DSA", issuer: "freeCodeCamp", code: "FCC-JS" },
    { title: "Google UX Design Certification", issuer: "Google Professional", code: "GOOG-UX" }
  ];

  for (let i = 0; i < certifications.length; i += 2) {
    // Column 1
    doc.text("•", margin + 5, currentY + 0.5);
    text(certifications[i].title, margin + 14, currentY, { fontSize: 8.5, fontStyle: "bold", color: colors.darkText });
    currentY += 10;
    text(`${certifications[i].issuer} | Id: ${certifications[i].code}`, margin + 14, currentY, { fontSize: 8, fontStyle: "normal", color: colors.mutedText });
    
    // Column 2
    if (certifications[i+1]) {
      const col2X = margin + 265;
      doc.text("•", col2X + 5, currentY - 9.5);
      text(certifications[i+1].title, col2X + 14, currentY - 10, { fontSize: 8.5, fontStyle: "bold", color: colors.darkText });
      text(`${certifications[i+1].issuer} | Id: ${certifications[i+1].code}`, col2X + 14, currentY, { fontSize: 8, fontStyle: "normal", color: colors.mutedText });
    }
    currentY += 14;
  }

  // Save the PDF
  doc.save(`${name.replace(/\s+/g, "_")}_Resume.pdf`);
}
