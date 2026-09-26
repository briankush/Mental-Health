import { useEffect } from "react";
import { Link } from "react-router-dom";
import { initConsultationBooking } from "../../js/consultation.js";

export function HomePage() {
  useEffect(() => {
    initConsultationBooking();
  }, []);

  return (
    <main id="main-content">
      <section className="home-hero">
        <img className="home-hero__image" src="/assets/images/hero-calm.jpg" alt="A quiet, sunlit chair beside a window" fetchPriority="high" />
        <div className="home-hero__shade" aria-hidden="true" />
        <div className="home-hero__fade" aria-hidden="true" />
        <div className="home-hero__content">
          <span className="kicker">A calmer way forward</span>
          <h1>Feel more like yourself again.</h1>
          <p>Thoughtful support for your mental wellbeing through compassionate care, practical guidance, and a community that understands.</p>
          <div className="home-actions"><a className="btn" href="#consultation">Find support <span aria-hidden="true">&rarr;</span></a><Link className="btn btn--hero-outline" to="/articles">Explore resources</Link></div>
        </div>
      </section>
      <section className="home-trust" aria-label="Why MindfulPath">
        <div className="container home-trust__inner">
          <div className="home-trust__item"><span className="home-trust__icon" aria-hidden="true" /><div><strong>Qualified guidance</strong><span>Care shaped by trusted professionals</span></div></div>
          <div className="home-trust__item"><span className="home-trust__icon" aria-hidden="true" /><div><strong>Private by design</strong><span>A secure space for your wellbeing</span></div></div>
          <div className="home-trust__item"><span className="home-trust__icon" aria-hidden="true" /><div><strong>Support that fits</strong><span>Move forward at your own pace</span></div></div>
        </div>
      </section>
      <section className="home-section" id="about">
        <div className="container home-section--split">
          <div className="home-section__intro"><span className="kicker">About MindfulPath</span><h2>Education-first support for real communities.</h2><p>We make mental-health learning clearer, more practical, and easier to discuss in daily life.</p></div>
          <div className="home-about__content"><p>MindfulPath brings together education, social context, guided training, community dialogue, and supported pathways to professional consultation.</p><div className="home-about__grid"><article><h3>What we offer</h3><p>Articles, podcasts, e-books, book-club sessions, guided courses, moderated community rooms, and consultation booking.</p></article><article><h3>How we work</h3><p>Our content is educational and community-oriented, with clinical and payment workflows integrated through secured backend APIs.</p></article></div></div>
        </div>
      </section>
      <section className="home-section home-section--paths">
        <div className="container home-section--split">
          <div className="home-section__intro"><span className="kicker">Your next step</span><h2>Support should meet you where you are.</h2><p>Whether you want to talk, learn, or simply feel understood, there is a place to begin.</p></div>
          <div className="home-paths">
            <a className="home-path" href="#consultation"><div><span className="home-path__number">01</span><div className="home-path__icon" aria-hidden="true">&#9825;</div></div><div><h3>Talk to someone</h3><p>Connect with a qualified practitioner who listens, understands, and meets you where you are.</p></div><span className="home-path__link">Find a practitioner <span aria-hidden="true">&rarr;</span></span></a>
            <Link className="home-path" to="/articles"><div><span className="home-path__number">02</span><div className="home-path__icon" aria-hidden="true">&#9634;</div></div><div><h3>Learn at your pace</h3><p>Explore practical articles, guided exercises, and expert insight for the moments that matter.</p></div><span className="home-path__link">Explore resources <span aria-hidden="true">&rarr;</span></span></Link>
            <Link className="home-path" to="/community"><div><span className="home-path__number">03</span><div className="home-path__icon" aria-hidden="true">&#9829;</div></div><div><h3>Feel less alone</h3><p>Join thoughtful conversations and find steady encouragement from people who understand.</p></div><span className="home-path__link">Visit the community <span aria-hidden="true">&rarr;</span></span></Link>
          </div>
        </div>
      </section>
      <section className="home-library home-section"><div className="container"><div className="home-library__header"><div><span className="kicker">From the library</span><h2>A little room to breathe.</h2></div><Link to="/articles">View the library <span aria-hidden="true">&rarr;</span></Link></div><div className="home-library__grid"><Link className="home-library__item" to="/article"><span className="home-library__meta">Read &middot; 6 min</span><h3>How to quiet an overthinking mind</h3><p>Gentle ways to step out of the loop and back into the present.</p><span className="arrow-link">Read article <span aria-hidden="true">&rarr;</span></span></Link><Link className="home-library__item" to="/podcast"><span className="home-library__meta">Listen &middot; 18 min</span><h3>Rest is part of the work</h3><p>A thoughtful conversation about slowing down without guilt.</p><span className="arrow-link">Listen now <span aria-hidden="true">&rarr;</span></span></Link><Link className="home-library__item" to="/quizzes"><span className="home-library__meta">Reflect &middot; 3 min</span><h3>Check in with yourself</h3><p>A private reflection to help you notice what you may need today.</p><span className="arrow-link">Start reflection <span aria-hidden="true">&rarr;</span></span></Link></div></div></section>
      <section className="home-section" id="consultation"><div className="container home-care"><img className="home-care__image" src="/assets/images/hero-calm.jpg" alt="A comfortable chair in a peaceful therapy space" loading="lazy" /><div className="home-care__copy"><span className="kicker">Professional care</span><h2>The right conversation can change a lot.</h2><p>Meet with a compassionate practitioner in a private, judgment-free space. Choose a time that works for you and take the first step when you feel ready.</p><ul className="home-care__list"><li><span className="home-care__check">&#10003;</span>Qualified, caring practitioners</li><li><span className="home-care__check">&#10003;</span>Private and confidential</li><li><span className="home-care__check">&#10003;</span>Appointments that fit your schedule</li></ul></div><aside className="home-booking-profile"><h3>Professional profile</h3><p><strong>Grace Nyambura</strong></p><p className="meta">Counseling Psychology &middot; Video / In-person</p><p className="meta">45 minutes &middot; KES 3,000</p><p className="state">Availability and profile data should come from backend scheduling APIs.</p></aside><div className="home-booking" data-booking-root /></div></section>
      <section className="home-cta"><div className="container home-cta__inner"><div><h2>You do not have to figure it out alone.</h2><p>Start small. Start today. We will meet you there.</p></div><a className="btn" href="#consultation">Find your next step <span aria-hidden="true">&rarr;</span></a></div></section>
    </main>
  );
}
