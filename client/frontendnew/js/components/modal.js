export function createModal(id = "default-modal") {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.id = id;
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
      <h3 id="${id}-title">Dialog</h3>
      <div data-modal-body></div>
      <div class="form-actions">
        <button type="button" class="btn btn--secondary" data-modal-close>Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop || event.target.closest("[data-modal-close]")) {
      closeModal(backdrop);
    }
  });
  return backdrop;
}

export function openModal(modalEl, title, htmlBody) {
  modalEl.querySelector("h3").textContent = title;
  modalEl.querySelector("[data-modal-body]").innerHTML = htmlBody;
  modalEl.classList.add("is-open");
}

export function closeModal(modalEl) {
  modalEl.classList.remove("is-open");
}
