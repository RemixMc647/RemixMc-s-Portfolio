// Current year in footer
const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}


// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", function (event) {
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});


// Small reveal animation when sections enter the screen
const sections = document.querySelectorAll(".section, .contact");

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
