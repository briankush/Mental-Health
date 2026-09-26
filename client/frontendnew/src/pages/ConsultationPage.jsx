import { useEffect } from "react";
import { initConsultationBooking } from "../../js/consultation.js";

export function ConsultationPage() {
  useEffect(() => {
    document.title = "Consultation | MindfulPath";
    initConsultationBooking();
  }, []);

  return (
    <main id="main-content" className="section">
      <section className="container editorial-block">
        <span className="kicker">Consultation</span>
        <h1>Book a session with a mental-health professional.</h1>
        <p>Select your professional, choose a date and time, review details, then proceed to secure M-PESA checkout.</p>
      </section>
      <section className="container consultation-grid section--tight">
        <aside className="surface panel">
          <h3>Professional Profile</h3>
          <p><strong>Grace Nyambura</strong></p>
          <p className="meta">Area of expertise: Counseling Psychology</p>
          <p className="meta">Consultation type: Video / In-person</p>
          <p className="meta">Duration: 45 minutes</p>
          <p className="meta">Price: KES 3,000</p>
          <p className="state">Availability and profile data should come from backend scheduling APIs.</p>
        </aside>
        <div data-booking-root />
      </section>
    </main>
  );
}
