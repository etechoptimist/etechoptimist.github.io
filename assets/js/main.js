// assets/js/main.js
// Static-site friendly (no Jekyll). Loads partial HTML sections + Medium RSS.
// Requires:
//   /partials/articles-inner.html   (contains H2 + #articles-list)
//   /partials/certifications.html   (contains full Certifications markup for insertion)
//
// In index.html you should have placeholders:
//   <section id="articles">...</section>   (kept as a real section to preserve #articles anchor)
//   <div id="certifications-container">Loading certifications...</div>

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
   * 2) Certifications partial injection
   * ==========================================
   * Loads /partials/certifications.html into #certifications-container
   */
  async function injectCertificationsSection() {
  const container = document.getElementById("certifications-container");
  if (!container) return;

  try {
    const url = "/partials/certifications.html";
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      container.innerHTML = `⚠️ Unable to load certifications (${res.status}). Check: ${url}`;
      return;
    }

    container.innerHTML = await res.text();
  } catch (e) {
    container.innerHTML = `⚠️ Unable to load certifications (fetch error).`;
  }
}
  /**
   * ==========================================
   * 3) Articles inner partial injection
   * ==========================================
   * Keeps <section id="articles"> in index.html so #articles anchor always works.
   * Replaces the inner HTML of that section with /partials/articles-inner.html,
   * but only if #articles-list is not already present.
   */
  async function injectArticlesSection() {
    const articlesSection = document.getElementById("articles");
    if (!articlesSection) return;

    try {
      // If the list already exists, don't overwrite.
      const alreadyHasList = !!document.getElementById("articles-list");
      if (alreadyHasList) return;

      const res = await fetch("/partials/articles-inner.html", { cache: "no-store" });
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
   * 4) Medium feed loader
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
   * =========================
   * Boot sequence
   * =========================
   * 1) Inject certifications (independent)
   * 2) Inject articles inner (creates #articles-list if missing)
   * 3) Load Medium feed into #articles-list
   */
  (async () => {
    await injectCertificationsSection();
    await injectArticlesSection();
    await loadMediumArticles();
  })();
});
