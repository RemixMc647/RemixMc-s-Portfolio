// Set the current year in the footer
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// Smooth scrolling for navigation links
const navigationLinks = document.querySelectorAll(
  'a[href^="#"]'
);

navigationLinks.forEach((link) => {

  link.addEventListener("click", (event) => {

    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (target) {
      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

  });

});


// Section reveal animation
const sections = document.querySelectorAll(
  ".section, .contact"
);

const observer = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }

    });

  },
  {
    threshold: 0.12
  }
);


sections.forEach((section) => {
  observer.observe(section);
});



// Contact form -> /api/contact (server sends the email with Resend)
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const sendBtn = document.getElementById("send-btn");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
      statusEl.textContent = "Please fill in all fields.";
      statusEl.className = "form-status error";
      return;
    }

    sendBtn.disabled = true;
    sendBtn.textContent = "Sending...";
    statusEl.textContent = "";
    statusEl.className = "form-status";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        form.reset();
        statusEl.textContent = "Message sent! I'll get back to you soon.";
        statusEl.className = "form-status success";
      } else {
        statusEl.textContent =
          result.error || "Something went wrong. Please try again.";
        statusEl.className = "form-status error";
      }
    } catch (error) {
      statusEl.textContent =
        "Network error. Please try again or email me directly.";
      statusEl.className = "form-status error";
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send Message";
    }
  });
}
