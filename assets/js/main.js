// assets/js/main.js

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

    // Close menu when a link is clicked (mobile UX)
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }

  /**
   * ==========================================
   * 2) Articles section injection (no Jekyll)
   * ==========================================
   * This is for the case when GitHub Pages is NOT running Jekyll includes.
   *
   * You should create:
   *   /partials/articles-inner.html
   * with this content:
   *   <h2>Recent Articles</h2>
   *   <div id="articles-list">Loading latest Medium posts...</div>
   *
   * And in index.html keep:
   *   <section id="articles"> ...fallback... </section>
   *
   * This loader will replace the inside of the section while keeping
   * the same layout and IDs.
   */
  async function injectArticlesSection() {
    const articlesSection = document.getElementById("articles");
    if (!articlesSection) return;

    try {
      // Optional: if you want to skip injection when already present
      // (example: if you later enable Jekyll and render full section)
      const alreadyHasList = !!document.getElementById("articles-list");
      if (alreadyHasList) return;

      const res = await fetch("/partials/articles-inner.html", { cache: "no-store" });
      if (!res.ok) return;

      const html = await res.text();
      articlesSection.innerHTML = html;

      // If user loaded directly with #articles, ensure scroll after injection
      if (window.location.hash === "#articles") {
        articlesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (e) {
      // Keep existing fallback content if injection fails
    }
  }

  /**
   * =========================
   * 3) Medium feed loader
   * =========================
   * Keeps the same card layout and behavior you had before.
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
      items.slice(0, 8).forEach((article) => {
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

      // If feed is empty, show a friendly message
      if (items.length === 0) {
        container.innerHTML = "⚠️ No Medium posts found.";
      }
    } catch (e) {
      const container = document.getElementById("articles-list");
      if (container) container.innerHTML = "⚠️ Unable to load Medium articles.";
    }
  }

  /**
   * =========================
   * Boot sequence
   * =========================
   * 1) Inject articles partial (if needed)
   * 2) Load Medium feed (needs #articles-list)
   */
  (async () => {
    await injectArticlesSection();
    await loadMediumArticles();
  })();
});
