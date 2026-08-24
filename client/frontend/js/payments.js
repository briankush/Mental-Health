import { createModal, openModal } from "./components/modal.js";
import { showToast } from "./components/toast.js";

let paymentModal;

function ensureModal() {
  if (!paymentModal) {
    paymentModal = createModal("payment-modal");
  }
  return paymentModal;
}

export function initPayments() {
  document.addEventListener("click", (event) => {
    const buyButton = event.target.closest("[data-buy-book]");
    const consultButton = event.target.closest("[data-book-consultation]");

    if (!buyButton && !consultButton) {
      return;
    }

    const modal = ensureModal();
    openModal(
      modal,
      "M-PESA Checkout",
      `<p class="meta">Secure payment UI placeholder.</p>
       <div class="state">Daraja integration point: initiate STK push via backend endpoint. Never expose credentials in frontend code.</div>
       <div class="form-row"><label for="phone">M-PESA phone number</label><input id="phone" type="tel" placeholder="07xx xxx xxx"></div>
       <div class="form-actions"><button class="btn" data-trigger-payment>Proceed</button></div>`
    );

    modal.querySelector("[data-trigger-payment]")?.addEventListener("click", () => {
      showToast("Payment request UI submitted. Backend Daraja API call needed.", "success");
    });
  });
}
