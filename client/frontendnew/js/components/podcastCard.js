export function podcastCard(podcast) {
  return `
    <article class="content-card">
      <div class="content-card__media"><img src="${podcast.image}" alt="${podcast.imageAlt}"></div>
      <div class="content-card__body">
        <span class="kicker">Podcast</span>
        <h3>${podcast.title}</h3>
        <p>${podcast.description}</p>
        <p class="meta">Host: ${podcast.host} · ${podcast.duration}</p>
        <a class="arrow-link" href="${podcast.href}">Listen episode</a>
      </div>
    </article>
  `;
}
