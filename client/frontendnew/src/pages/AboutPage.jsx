import { useEffect } from "react";

export function AboutPage() {
  useEffect(() => {
    document.title = "About | MindfulPath";
  }, []);

  return (
    <main id="main-content" className="section">
      <section className="container editorial-block">
        <span className="kicker">About MindfulPath</span>
        <h1>Education-first mental-health support for real communities.</h1>
        <p>MindfulPath is built to make mental-health learning clearer, more practical, and easier to discuss in daily life. We focus on education, social context, training, and supported pathways to professional consultation.</p>
      </section>
      <section className="container section--tight">
        <div className="split">
          <article className="surface panel">
            <h3>What we offer</h3>
            <p>Articles, podcasts, e-books, weekly book club sessions, guided courses, moderated community rooms, and consultation booking.</p>
          </article>
          <article className="surface panel">
            <h3>How we work</h3>
            <p>Content is educational and community-oriented. Clinical or payment workflows are integrated through secured backend APIs.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
