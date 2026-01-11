// ✅ Mobile menu toggle (same behavior as before)
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("mobile-menu");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    // Optional: close menu when a link is clicked
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }

  // ✅ Medium feed loader (same layout output as before)
  async function loadMediumArticles() {
    const container = document.getElementById("articles-list");
    if (!container) return;

    try {
      const rssUrl =
        "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@etechoptimist";

      const res = await fetch(rssUrl);
      const data = await res.json();

      container.innerHTML = "";

      (data.items || []).slice(0, 8).forEach((article) => {
        const el = document.createElement("div");
        el.classList.add("article-card");

        const cleanText = (article.description || "")
          .replace(/<[^>]+>/g, "")
          .substring(0, 180);

        el.innerHTML = `
          <a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.title}</a>
          <small>${new Date(article.pubDate).toLocaleDateString()}</small>
          <p>${cleanText}...</p>
        `;

        container.appendChild(el);
      });
    } catch (e) {
      container.innerHTML = "⚠️ Unable to load Medium articles.";
    }
  }

  loadMediumArticles();
});
