export function PlaceholderPage({ title, admin = false }) {
  return (
    <main id="main-content" className={admin ? "section admin-page" : "section"}>
      <div className="container content-medium">
        <span className="kicker">{admin ? "Administration" : "MindfulPath"}</span>
        <h1>{title}</h1>
        <p>This route is connected to the React/Vite application. Its existing content and workflow are being migrated here without changing the Express API contract.</p>
      </div>
    </main>
  );
}
