// assets/js/main.js
// Static-site friendly (no Jekyll). Loads partial HTML sections + Medium RSS.
// Requires these files to exist (and be reachable in the browser):
//   partials/education.html
//   partials/certifications.html
//   partials/articles-inner.html
//
// In index.html you should have placeholders:
//
// Education:
//   <section id="studies">
//     <h2>Education</h2>
//     <div id="education-container">Loading education...</div>
//   </section>
//
// Certifications:
//   <section id="certifications">
//     <h2>Certifications</h2>
//     <div id="certifications-container">Loading certifications...</div>
//   </section>
//
// Articles (keep the real section so #articles anchor always exists):
//   <section id="articles"> ...fallback... </section>

document.addEventListener("DOMContentLoaded", () => {
  /**
   * =========================
   * 1) Mobile menu toggle
   * =========================
   */
  const menuToggle = document.getElementById("mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    // Close menu when a link is clicked
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }

  /**
   * ==========================================
   * 2) Education partial injection
   * ==========================================
   * Loads partials/education.html into #education-container
   */
  async function injectEducationSection() {
  const container = document.getElementById("education-container");
  if (!container) return;

  const url = "partials/education.html"; // keep relative (no leading slash)

  try {
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      container.innerHTML = `⚠️ Unable to load education (${res.status}). Check: ${url}`;
      return;
    }

    container.innerHTML = await res.text();
  } catch (e) {
    container.innerHTML = `⚠️ Unable to load education (fetch error). Check: ${url}`;
  }
}


  /**
   * ==========================================
   * 3) Certifications partial injection
   * ==========================================
   * Loads partials/certifications.html into #certifications-container
   */
  async function injectCertificationsSection() {
    const container = document.getElementById("certifications-container");
    if (!container) return;

    try {
      const res = await fetch("partials/certifications.html", { cache: "no-store" });
      if (!res.ok) {
        container.innerHTML = `⚠️ Unable to load certifications (${res.status}).`;
        return;
      }
      container.innerHTML = await res.text();
    } catch (e) {
      container.innerHTML = "⚠️ Unable to load certifications.";
    }
  }

  /**
   * ==========================================
   * 4) Articles inner partial injection
   * ==========================================
   * Keeps <section id="articles"> in index.html so #articles anchor always works.
   * Replaces the inside of that section with partials/articles-inner.html,
   * but only if #articles-list is not already present.
   */
  async function injectArticlesSection() {
    const articlesSection = document.getElementById("articles");
    if (!articlesSection) return;

    try {
      // If the list already exists, don't overwrite.
      const alreadyHasList = !!document.getElementById("articles-list");
      if (alreadyHasList) return;

      const res = await fetch("partials/articles-inner.html", { cache: "no-store" });
      if (!res.ok) return;

      articlesSection.innerHTML = await res.text();

      // If user loaded directly with #articles, ensure scroll AFTER injection
      if (window.location.hash === "#articles") {
        articlesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (e) {
      // Keep fallback content if injection fails
    }
  }

  /**
   * =========================
   * 5) Medium feed loader
   * =========================
   * Fills #articles-list with cards (same behavior as your original code).
   */
  async function loadMediumArticles() {
    const container = document.getElementById("articles-list");
    if (!container) return;

    try {
      const rssUrl =
        "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@etechoptimist";

      const res = await fetch(rssUrl);
      const data = await res.json();

      container.innerHTML = "";

      const items = Array.isArray(data.items) ? data.items : [];
      const top = items.slice(0, 8);

      top.forEach((article) => {
        const el = document.createElement("div");
        el.classList.add("article-card");

        const title = article.title || "Untitled";
        const link = article.link || "#";
        const pubDate = article.pubDate ? new Date(article.pubDate) : null;

        const cleanText = (article.description || "")
          .replace(/<[^>]+>/g, "")
          .substring(0, 180);

        el.innerHTML = `
          <a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>
          <small>${pubDate ? pubDate.toLocaleDateString() : ""}</small>
          <p>${cleanText}${cleanText.length ? "..." : ""}</p>
        `;

        container.appendChild(el);
      });

      if (top.length === 0) {
        container.innerHTML = "⚠️ No Medium posts found.";
      }
    } catch (e) {
      const container2 = document.getElementById("articles-list");
      if (container2) container2.innerHTML = "⚠️ Unable to load Medium articles.";
    }
  }

    /**
   * ==========================================
   * Inject Budgy Project
   * ==========================================
   */

  async function injectFinancialCoachingProject() {
  const container = document.getElementById("project-financial-coaching-container");
  if (!container) return;

  try {
    const res = await fetch("partials/project-financial-coaching.html", { cache: "no-store" });
    if (!res.ok) {
      container.innerHTML = "⚠️ Unable to load project.";
      return;
    }
    container.innerHTML = await res.text();

    // Re-render Mermaid diagrams after injection
    if (window.mermaid) {
      mermaid.init(undefined, container.querySelectorAll(".mermaid"));
    }
  } catch (e) {
    container.innerHTML = "⚠️ Unable to load project.";
  }
}


  /**
   * =========================
   * Boot sequence
   * =========================
   * 1) Inject education
   * 2) Inject certifications
   * 3) Inject articles inner (creates #articles-list if missing)
   * 4) Load Medium feed into #articles-list
   */
  (async () => {
    await injectEducationSection();
    await injectCertificationsSection();
    await injectFinancialCoachingProject();
    await injectArticlesSection();
    await loadMediumArticles();
  })();
});
