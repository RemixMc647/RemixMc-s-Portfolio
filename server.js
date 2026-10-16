const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { Resend } = require("resend");

const app = express();
app.set("trust proxy", 1); // needed on Render so rate limiting sees real IPs
app.use(express.json({ limit: "10kb" }));

// Everything lives in the root folder, so only these files are served to
// visitors. server.js and package.json stay private. If you add images or
// other files later, add their names to this list.
const PUBLIC_FILES = ["index.html", "style.css", "script.js"];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

PUBLIC_FILES.forEach((file) => {
  app.get("/" + file, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// The API key lives ONLY here on the server (environment variable).
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const TO = process.env.CONTACT_TO || "adelabuaderemi02@gmail.com";
const FROM = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Too many messages. Please try again later." }
});

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

app.post("/api/contact", limiter, async (req, res) => {
  const { name, email, message, website } = req.body || {};

  // Honeypot: bots fill this hidden field. Pretend success, send nothing.
  if (website) return res.json({ ok: true });

  const cleanName = String(name || "").trim().slice(0, 100);
  const cleanEmail = String(email || "").trim().slice(0, 150);
  const cleanMessage = String(message || "").trim().slice(0, 3000);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ ok: false, error: "Please fill in all fields." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ ok: false, error: "Please enter a valid email address." });
  }
  if (!resend) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ ok: false, error: "Email service is not configured yet." });
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: cleanEmail,
      subject: `Portfolio message from ${cleanName.replace(/[\r\n]+/g, " ")}`,
      text: `From: ${cleanName} <${cleanEmail}>\n\n${cleanMessage}`,
      html: `<p><strong>From:</strong> ${escapeHtml(cleanName)} (${escapeHtml(cleanEmail)})</p>
             <p>${escapeHtml(cleanMessage).replace(/\n/g, "<br>")}</p>`
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({ ok: false, error: "Could not send your message. Please try again." });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Server error. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Portfolio running on port ${PORT}`));
