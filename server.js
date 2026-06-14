import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const MESSAGES_FILE = process.env.VERCEL
  ? path.join("/tmp", "messages.json")
  : path.join(process.cwd(), "messages.json");

// Helper to read messages
function readMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading messages:", error);
  }
  return [];
}

// Helper to save messages
function saveMessages(messages) {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving messages:", error);
  }
}

// Helper to send email notifications via Nodemailer
async function sendEmailNotification(name, email, subject, message) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("Nodemailer configuration missing. Email was not sent. Please populate EMAIL_USER and EMAIL_PASS in your secrets configuration.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass, // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"${name}" <${user}>`, // Use authenticated user to pass SMTP relays, and set Reply-To for easy replies
      to: "ravimalakar091@gmail.com", // Recipient email address
      replyTo: email,
      subject: `[Portfolio Contact Alert] - ${subject}`,
      text: `You have received a new contact submission from your portfolio website!

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
"${message}"

-----
Notification sent from: ${process.env.APP_URL || "Local Node.js Server"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid rgba(255,107,74,0.2); border-radius: 16px; background-color: #0d1b2a; color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size: 28px; font-weight: bold; color: #ff6b4a; tracking-wide: 1px; text-transform: uppercase;">Portfolio Alert</span>
          </div>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 15px 0;" />
          <div style="margin: 20px 0; font-size: 14px; line-height: 1.6; color: #bfc8d6;">
            <p style="margin: 6px 0;"><strong style="color: #ff7b54;">Sender Name:</strong> ${name}</p>
            <p style="margin: 6px 0;"><strong style="color: #ff7b54;">Email Address:</strong> <a href="mailto:${email}" style="color: #ffffff; text-decoration: underline;">${email}</a></p>
            <p style="margin: 6px 0;"><strong style="color: #ff7b54;">Subject Title:</strong> ${subject}</p>
          </div>
          <div style="background-color: rgba(255,255,255,0.03); padding: 18px; border-left: 4px solid #ff6b4a; border-radius: 6px; margin: 20px 0; color: #e2e8f0; font-style: italic; font-size: 14px; line-height: 1.7; font-family: sans-serif;">
            "${message.replace(/\n/g, "<br/>")}"
          </div>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 20px 0;" />
          <p style="font-size: 11px; color: #7a8799; text-align: center; margin-top: 20px; font-family: monospace;">
            Automatic notification dispatched via system-host server container.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email notification successfully dispatched:", info.messageId);
    return true;
  } catch (error) {
    console.error("Nodemailer failed to send email:", error);
    const errMsg = error.message || "";
    if (error.code === "EAUTH" || errMsg.includes("535-5.7.8") || errMsg.includes("Username and Password not accepted")) {
      console.error("\n========================= Gmail SMTP Authentication Failure =========================");
      console.error("🚨 Gmail security rejected the login credentials provided.");
      console.error("💡 Cause: You are likely using your standard Google Account account password.");
      console.error("🛠️  Solution: You must use a 16-digit Google 'App Password'.");
      console.error("👉 Follow these steps to resolve:");
      console.error("   1. Enable '2-Step Verification' on your Google account.");
      console.error("   2. Visit: https://myaccount.google.com/apppasswords");
      console.error("   3. Generate an App Password (select App as 'Mail' or 'Other', then choose device).");
      console.error("   4. Copy the generated 16-digit code (e.g. 'abcd efgh ijkl mnop').");
      console.error("   5. Update EMAIL_PASS with this 16-character code (without spaces) in your .env / Secrets.");
      console.error("====================================================================================\n");
    }
    return false;
  }
}

// API endpoint to send a message (Contact Form)
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const newMessage = {
    id: Date.now().toString(),
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString(),
  };

  const messages = readMessages();
  messages.unshift(newMessage); // put latest first
  saveMessages(messages);

  // Dispatch real-time email notification in the background
  const emailResult = await sendEmailNotification(name, email, subject, message);

  res.status(200).json({ 
    success: true, 
    message: "Message received successfully!",
    emailSent: emailResult 
  });
});

// GET all messages (for the admin preview or recruiter logs in the dashboard)
app.get("/api/messages", (req, res) => {
  const messages = readMessages();
  res.json(messages);
});

// Admin command to clear messages
app.delete("/api/messages", (req, res) => {
  saveMessages([]);
  res.json({ success: true, message: "Inbox cleared successfully!" });
});

// Memory cache for GitHub developer data to avoid rate limit throttling
const githubCache = {};
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes cache

// API endpoint to fetch dynamic GitHub contribution calendar & developer metrics
app.get("/api/github/profile", async (req, res) => {
  const username = (req.query.username || "ravimali-dev").trim();

  // Check cache first
  const cached = githubCache[username];
  if (cached && cached.expiry > Date.now()) {
    return res.json(cached.data);
  }

  const headers = {
    "User-Agent": "aistudio-build",
    "Accept": "application/vnd.github.v3+json",
  };

  try {
    // Fetch profile
    const profileRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!profileRes.ok) {
      throw new Error(`GitHub API profile returned status ${profileRes.status}`);
    }
    const profile = await profileRes.json();

    // Fetch repos (to sum stargazers)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
    let totalStars = 0;
    if (reposRes.ok) {
      const repos = await reposRes.json();
      if (Array.isArray(repos)) {
        totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
      }
    }

    // Fetch public events (which contain push activity)
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
    let events = [];
    if (eventsRes.ok) {
      events = await eventsRes.json();
    }

    // Process contribution data (heat map for last 140 days -> 20 weeks)
    const activityMap = {};
    const dateArray = [];
    const today = new Date();

    // Initialize last 140 days with 0
    for (let i = 139; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0]; // YYYY-MM-DD
      activityMap[dateString] = 0;
    }

    // Populate counts from events
    let recentCommits = [];

    if (Array.isArray(events)) {
      events.forEach((evt) => {
        if (!evt.created_at) return;
        const dateString = evt.created_at.split("T")[0];
        
        // Only count if it's within our target range of 140 days
        if (activityMap[dateString] !== undefined) {
          if (evt.type === "PushEvent" && evt.payload) {
            const commitCount = evt.payload.size || (evt.payload.commits ? evt.payload.commits.length : 1);
            activityMap[dateString] += commitCount;

            // Collect recent commits for visual list
            if (evt.payload.commits && Array.isArray(evt.payload.commits)) {
              evt.payload.commits.forEach((c) => {
                if (recentCommits.length < 5) {
                  recentCommits.push({
                    sha: c.sha ? c.sha.substring(0, 7) : "commit",
                    message: c.message || "Updated modules",
                    repoName: evt.repo ? evt.repo.name : "repository",
                    timestamp: evt.created_at,
                  });
                }
              });
            }
          } else {
            // Count other contributions (pull request, issues, etc.) as 1 contribution
            activityMap[dateString] += 1;
          }
        }
      });
    }

    // Construct the activity list
    Object.keys(activityMap).sort().forEach((dateStr) => {
      dateArray.push({
        date: dateStr,
        count: activityMap[dateStr],
      });
    });

    // Sum recent period commits
    const periodCommitSum = dateArray.reduce((acc, curr) => acc + curr.count, 0);

    const resultData = {
      isMock: false,
      user: {
        username: profile.login || username,
        name: profile.name || profile.login || username,
        bio: profile.bio || "Full-Stack Software Craftsman",
        avatarUrl: profile.avatar_url || "",
        publicRepos: profile.public_repos || 0,
        followers: profile.followers || 0,
        following: profile.following || 0,
        totalStars,
      },
      periodCommitSum,
      activity: dateArray,
      recentCommits,
    };

    // Save to cache
    githubCache[username] = {
      data: resultData,
      expiry: Date.now() + CACHE_DURATION_MS,
    };

    return res.json(resultData);

  } catch (error) {
    console.error("GitHub Fetch Error, returning fallback mockup:", error.message);
    
    // GENERATE EXCELLENT FALLBACK DATA matching the username
    const today = new Date();
    const dateArray = [];
    const activityMap = {};

    // Initialize last 140 days
    for (let i = 139; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      
      // Seed with highly realistic, aesthetically beautiful code metrics (randomized weights)
      const seedVal = (i * 13 + 7) % 7;
      let count = 0;
      if (seedVal === 0) count = 0;
      else if (seedVal < 3) count = Math.floor(Math.random() * 3) + 1; // 1-3
      else if (seedVal < 5) count = Math.floor(Math.random() * 5) + 3; // 3-7
      else count = Math.floor(Math.random() * 2) + 1; // 1-2

      activityMap[dateString] = count;
    }

    Object.keys(activityMap).sort().forEach((dateStr) => {
      dateArray.push({
        date: dateStr,
        count: activityMap[dateStr],
      });
    });

    const periodCommitSum = dateArray.reduce((acc, curr) => acc + curr.count, 0);

    // Fallback commits list
    const fallbackCommits = [
      { sha: "a52c38b", message: "chore: compile production asset files for deploy", repoName: `${username}/portfolio-remix`, timestamp: new Date(Date.now() - 3600000).toISOString() },
      { sha: "bc9fd01", message: "feat: establish multi-agent chat broker and schema pipeline", repoName: `${username}/portfolio-remix`, timestamp: new Date(Date.now() - 14400000).toISOString() },
      { sha: "8ffec12", message: "fix: solve flex layouts overflow constraints on touchscreens", repoName: `${username}/atmosphere-weather`, timestamp: new Date(Date.now() - 86400000).toISOString() },
      { sha: "db3110e", message: "docs: update readme credentials and configuration steps", repoName: `${username}/orbittasks-todo`, timestamp: new Date(Date.now() - 172800000).toISOString() },
      { sha: "52aa19f", message: "feat: add secure cookie sessions decryption middleware", repoName: `${username}/guardvault-auth`, timestamp: new Date(Date.now() - 259200000).toISOString() }
    ];

    const resultData = {
      isMock: true,
      user: {
        username,
        name: username === "ravimali-dev" || username === "ravimalakar" ? "Ravi Mali" : username,
        bio: username === "ravimali-dev" || username === "ravimalakar" ? "BCA Student | Frontend Developer | React.js & JavaScript" : "Developer & Adventurer",
        avatarUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80`,
        publicRepos: username === "ravimali-dev" || username === "ravimalakar" ? 15 : 24,
        followers: username === "ravimali-dev" || username === "ravimalakar" ? 54 : 82,
        following: username === "ravimali-dev" || username === "ravimalakar" ? 42 : 41,
        totalStars: username === "ravimali-dev" || username === "ravimalakar" ? 28 : 118,
      },
      periodCommitSum,
      activity: dateArray,
      recentCommits: fallbackCommits,
    };

    return res.json(resultData);
  }
});

// Helper for fallback responses when Gemini is unavailable (e.g., 503 overload)
function getOfflineFallbackResponse(prompt) {
  const query = prompt.toLowerCase();
  
  if (query.includes("project") || query.includes("portfolio") || query.includes("work") || query.includes("build")) {
    return `Ravi Mali has built some outstanding applications! His main active project showcase consists of:\n\n` +
      `1. **Live Video Conferencing & Chat App**\n` +
      `   *Designed and developed an immersive video communicating environment supporting web RTC flows, messaging hubs, and seamless screen sharing capabilities.*\n` +
      `   * **Tech**: React, Node.js, Express, MongoDB, Tailwind CSS\n` +
      `   * **GitHub**: [ravimali-dev/Minor-Project](https://github.com/ravimali-dev/Minor-Project)\n\n` +
      `2. **Blogify: Modern Blogging Platform**\n` +
      `   *A full-stack blogging workspace enabling users to create, edit, publish, and manage blog posts with Appwrite database integration.*\n` +
      `   * **Tech**: React, Tailwind CSS, Appwrite SDK, JavaScript\n` +
      `   * **GitHub**: [ravimali-dev/Blogify](https://github.com/ravimali-dev/Blogify)\n\n` +
      `3. **Interactive AI-Twin Developer Portfolio**\n` +
      `   *A full-stack developer portfolio implementing real-time communications, verified dynamic statistics metrics, and this recruiter chatbot interface.*\n` +
      `   * **Tech**: React, Express.js, Gemini API, Tailwind, Motion\n` +
      `   * **GitHub**: [ravimali-dev/interactive-portfolio](https://github.com/ravimali-dev/interactive-portfolio)\n\n` +
      `You can scroll up to click and examine these in his live Projects section of the website!`;
  }
  
  if (query.includes("skill") || query.includes("tech") || query.includes("language") || query.includes("know") || query.includes("framework")) {
    return `Ravi stands out for his professional skill weights, designed to maximize UX and visual quality:\n\n` +
      `* **Frontend Engineering**: React (React 18 & 19), JavaScript (ES6+), TypeScript, Tailwind CSS, HTML5, CSS3, Glassmorphism, and responsive motion micro-animations.\n` +
      `* **Backend Development**: Node.js and Express.js routing structures.\n` +
      `* **Database Management**: MongoDB and MySQL.\n` +
      `* **Tools & Control**: Git, GitHub, VS Code, and Postman API Testing.`;
  }
  
  if (query.includes("contact") || query.includes("email") || query.includes("hire") || query.includes("meet") || query.includes("schedule") || query.includes("message")) {
    return `Ravi is highly proactive and would love to hear from you directly! Here is how you can connect:\n\n` +
      `* **Email**: [ravimalakar091@gmail.com](mailto:ravimalakar091@gmail.com)\n` +
      `* **GitHub Profile**: [github.com/ravimali-dev](https://github.com/ravimali-dev)\n` +
      `* **LinkedIn Gateway**: [linkedin.com/in/ravi-mali-dev](https://www.linkedin.com/in/ravi-mali-dev)\n\n` +
      `If you'd like to leave an instant message, please scroll down to fill out the **Leave a Message** section. Doing so will persist your message directly in Ravi's personal inbox logs.`;
  }
  
  if (query.includes("education") || query.includes("study") || query.includes("university") || query.includes("degree") || query.includes("college") || query.includes("apex")) {
    return `Ravi is currently pursuing a **Bachelor of Computer Applications (BCA)** at **Apex University, Jaipur** (Batch of 2023 - 2026), where he maintains a CGPA of **7.5**.\n\n` +
      `His studies cover key computer science fundamentals, including Object-Oriented Programming (OOPs), Data Structures & Algorithms, Database Management Systems, and Web Software Architectures.`;
  }
  
  if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("welcome")) {
    return `Hello there! I am Ravi Mali's AI Twin Representative. How can I help you today?\n\n` +
      `Feel free to ask me anything about Ravi's **educational background at Apex University**, his active full-stack **projects**, his developmental **skills**, or how you can **contact and hire** him!`;
  }

  return `Hello from Ravi Mali's AI Twin Representative! Our core GenAI neural cluster is currently experiencing highly elevated demand (temporary Gemini API 503 limit). However, as a master of resilient architectures, I am running smoothly on local fallback mode!\n\n` +
    `Ask me anything about Ravi's:\n` +
    `- **Projects** (Live Video Conferencing, Blogify blogging platform, etc.)\n` +
    `- **Skills** (React, TypeScript, Express, MongoDB, Tailwind)\n` +
    `- **Education** (Pursuing BCA at Apex University with 7.5 CGPA)\n` +
    `- **Contact Info** (Email, GitHub link, LinkedIn link, or leaving an inbox message!)`;
}

// API endpoint to talk to Ravi's AI Twin
app.post("/api/chat", async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    const fallbackResponse = getOfflineFallbackResponse(prompt);
    const notice = `*💡 **Local Dev Tip:** To activate actual server-side Gemini AI responses on your local machine, create a \`.env\` file in the root folder and define \`GEMINI_API_KEY=your_key_here\` (get your free key at https://aistudio.google.com/). Currently running on high-fidelity offline fallback mode!*\n\n`;
    return res.json({ response: notice + fallbackResponse });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `You are the AI Twin / Professional Recruiter Assistant of Ravi Mali, an exceptionally talented Frontend Developer & aspiring Full-Stack Engineer.
Your target audience consists of Recruiters, Hiring Managers, Tech Founders, and potential collaborators visiting his portfolio.

Here is Ravi Mali's professional developer background:
- **Full Name**: Ravi Mali
- **Main Roles**: Frontend Developer | React Developer | Future Full Stack Engineer
- **Core Bio**: He builds modern, responsive, visually stunning and user-friendly web applications that solve real-world problems. Great design, clean code, accessibility, and smooth UX are his ultimate priorities.
- **Education**: Bachelor of Computer Applications (BCA) at Apex University, Jaipur, India. (Duration: 2023 - 2026, CGPA: 7.5). Fully understands computer science fundamentals, OOPs, DBMS, DSA, and Web Architectures.
- **Skills**:
  - **Frontend**: HTML5, CSS3, JavaScript (ES6+), React 18/19, Tailwind CSS v4, Motion (Animations)
  - **Backend**: Node.js, Express.js
  - **Database**: MongoDB, MySQL
  - **Tools**: Git, GitHub, VS Code, Postman
- **Featured Projects**:
  1. **Live Video Conferencing & Chat App**: Designed and developed an immersive video communicating environment supporting web RTC flows, messaging hubs, and seamless screen sharing capabilities. Technologies: React, Node.js, Express, MongoDB, Tailwind CSS. GitHub Link: https://github.com/ravimali-dev/Minor-Project
  2. **Blogify: Modern Blogging Platform**: A full-stack blogging web application enabling readers to create, edit, publish, and manage blog posts with secure session handling via Appwrite API gateway. Technologies: React, Tailwind CSS, Appwrite, JavaScript. GitHub Link: https://github.com/ravimali-dev/Blogify
  3. **Interactive AI-Twin Developer Portfolio**: Futuristic dark-themed portfolio website with dynamic scroll indicators, a server-persistence message inbox, and this very chatbot interface. Technologies: React, Express.js, Gemini API, Tailwind, Motion. GitHub Link: https://github.com/ravimali-dev/interactive-portfolio

**Conversation Style & Directives**:
1. Speak with professional charm, warmth, and humble competence. Be helpful, concise, and recruiter-friendly.
2. Structure your answers beautifully using markdown tables, brief lists, or bold tech terms.
3. Keep answers under 150 words when possible. If asked about personal matters, keep them strictly aligned with professional passion.
4. Ravi's contact details: Email: ravimalakar091@gmail.com. GitHub Profile: https://github.com/ravimali-dev. LinkedIn: https://www.linkedin.com/in/ravi-mali-dev.
5. If the recruiter asks to hire Ravi or arrange a meeting, enthusiastically guide them to leave a message in the "Leave a Message" contact form on the portfolio or email him directly!
6. Never break character. Always answer *about* Ravi as his AI representative agent.`;

    // Try multiple lightweight/lite models sequentially as fallbacks in case of temporary 503 spikes.
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-3.1-pro-preview"
    ];

    let responseText = "";
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        if (history && Array.isArray(history)) {
          const formattedHistory = history.map((h) => ({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }],
          })).slice(0, 10);

          const chatSession = ai.chats.create({
            model: model,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
            history: formattedHistory,
          });

          const response = await chatSession.sendMessage({ message: prompt });
          responseText = response.text || "";
        } else {
          const chatSession = ai.chats.create({
            model: model,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          const response = await chatSession.sendMessage({ message: prompt });
          responseText = response.text || "";
        }

        if (responseText) {
          break; // Success! Break out of the loop
        }
      } catch (err) {
        console.warn(`Gemini model ${model} failed:`, err.message || err);
        lastError = err;
      }
    }

    if (responseText) {
      return res.json({ response: responseText });
    }

    // Hand off to local professional offline fallback system if Google endpoints are totally overloaded (503)
    console.error("All Gemini API models failed. Activating professional fallback system:", lastError);
    const fallbackResponse = getOfflineFallbackResponse(prompt);
    return res.json({ response: fallbackResponse });

  } catch (error) {
    console.error("Error calling Gemini API client wrapper:", error);
    const fallbackResponse = getOfflineFallbackResponse(prompt);
    return res.json({ response: fallbackResponse });
  }
});

// Setup Vite Dev server or production build static folder
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully booted on port ${PORT}`);
  });
}

// Only boot and bind port locally; let Vercel handle request orchestration
if (!process.env.VERCEL) {
  bootstrap();
}

export default app;
