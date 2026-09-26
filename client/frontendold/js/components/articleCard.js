export function articleCard(article) {
  return `
    <article class="content-card">
      <div class="content-card__media"><img src="${article.image}" alt="${article.imageAlt}"></div>
      <div class="content-card__body">
        <span class="kicker">${article.category}</span>
        <h3>${article.title}</h3>
        <p>${article.excerpt}</p>
        <p class="meta">${article.readingTime} min read · ${article.date}</p>
        <a class="arrow-link" href="${article.href}">Read article</a>
      </div>
    </article>
  `;
}
