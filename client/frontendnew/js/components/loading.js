export function loadingMarkup(label = "Loading...") {
  return `<div class="state" role="status" aria-live="polite"><div style="display:flex;align-items:center;gap:0.5rem;"><span class="loader" aria-hidden="true"></span><span>${label}</span></div></div>`;
}
