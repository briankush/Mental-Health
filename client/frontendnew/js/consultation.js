import { showToast } from "./components/toast.js";

const steps = ["professional", "date", "time", "review", "payment"];

export function initConsultationBooking() {
  const root = document.querySelector("[data-booking-root]");
  if (!root) {
    return;
  }

  const state = {
    stepIndex: 0,
    professional: "",
    date: "",
    time: ""
  };

  function render() {
    const step = steps[state.stepIndex];
    const chips = steps.map((item, idx) => `<span class="step-chip ${idx === state.stepIndex ? "is-current" : ""}">${idx + 1}. ${item}</span>`).join("");

    let content = "";
    if (step === "professional") {
      content = `
        <h3>Select professional</h3>
        <div class="form-row">
          <label for="professional">Professional</label>
          <select id="professional">
            <option value="">Choose a professional</option>
            <option>Grace Nyambura - Counseling Psychology</option>
            <option>Dr. James Oloo - Clinical Psychology</option>
            <option>Susan Wairimu - Family Therapy</option>
          </select>
        </div>
      `;
    }

    if (step === "date") {
      content = `
        <h3>Select date</h3>
        <div class="form-row">
          <label for="date">Date</label>
          <input id="date" type="date">
        </div>
      `;
    }

    if (step === "time") {
      content = `
        <h3>Select available time</h3>
        <div class="form-row">
          <label for="time">Time slot</label>
          <select id="time">
            <option value="">Choose a time</option>
            <option>09:00 - 09:45</option>
            <option>11:00 - 11:45</option>
            <option>15:00 - 15:45</option>
          </select>
        </div>
      `;
    }

    if (step === "review") {
      content = `
        <h3>Review booking</h3>
        <p><strong>Professional:</strong> ${state.professional}</p>
        <p><strong>Date:</strong> ${state.date}</p>
        <p><strong>Time:</strong> ${state.time}</p>
        <p class="meta">Consultation type: Video session · Duration: 45 minutes · Price: KES 3,000</p>
      `;
    }

    if (step === "payment") {
      content = `
        <h3>Proceed to payment</h3>
        <p>Use M-PESA to confirm your booking.</p>
        <button class="btn" data-book-consultation>Continue to M-PESA</button>
      `;
    }

    root.innerHTML = `
      <div class="form-panel">
        <div class="booking-stepper">${chips}</div>
        ${content}
        <div class="form-actions">
          <button class="btn btn--secondary" data-prev ${state.stepIndex === 0 ? "disabled" : ""}>Back</button>
          <button class="btn" data-next ${state.stepIndex === steps.length - 1 ? "disabled" : ""}>Next</button>
        </div>
      </div>
    `;

    root.querySelector("[data-prev]")?.addEventListener("click", () => {
      state.stepIndex = Math.max(0, state.stepIndex - 1);
      render();
    });

    root.querySelector("[data-next]")?.addEventListener("click", () => {
      const professional = root.querySelector("#professional")?.value;
      const date = root.querySelector("#date")?.value;
      const time = root.querySelector("#time")?.value;

      if (step === "professional" && !professional) {
        showToast("Select a professional to continue.", "error");
        return;
      }
      if (step === "date" && !date) {
        showToast("Select a date to continue.", "error");
        return;
      }
      if (step === "time" && !time) {
        showToast("Select a time slot to continue.", "error");
        return;
      }

      if (professional) state.professional = professional;
      if (date) state.date = date;
      if (time) state.time = time;

      state.stepIndex = Math.min(steps.length - 1, state.stepIndex + 1);
      render();
    });
  }

  render();
}
