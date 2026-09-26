export function bookCard(book) {
  return `
    <article class="content-card">
      <div class="content-card__media"><img src="${book.cover}" alt="${book.coverAlt}"></div>
      <div class="content-card__body">
        <span class="kicker">${book.category}</span>
        <h3>${book.title}</h3>
        <p class="meta">by ${book.author}</p>
        <p>${book.description}</p>
        <p class="meta">${book.isFree ? "Free" : `KES ${book.price}`}</p>
        <div class="form-actions">
          <a class="btn btn--secondary" href="${book.previewHref}">Preview</a>
          <button class="btn" data-buy-book="${book.id}">${book.isFree ? "Add to Library" : "Purchase with M-PESA"}</button>
        </div>
      </div>
    </article>
  `;
}
