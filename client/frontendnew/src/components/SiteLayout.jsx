import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

function NavLink({ to, label, active }) {
  return <Link className={`nav-link ${active ? "is-active" : ""}`} to={to}>{label}</Link>;
}

export function SiteLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const authenticated = Boolean(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    setMenuOpen(false);
    document.body.classList.remove("menu-open");

    return () => document.body.classList.remove("menu-open");
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="navbar-wrap" id="top-nav">
        <div className="container navbar">
          <Link className="logo" to="/" aria-label="MindfulPath home">
            <span className="logo__mark" aria-hidden="true">MP</span>
            <span>MindfulPath</span>
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            <div className="nav-item"><NavLink to="/" label="Home" active={location.pathname === "/"} /></div>
            <div className="nav-item"><NavLink to="/about" label="About" active={location.pathname === "/about"} /></div>
            <div className="nav-item"><a className="nav-link">Resources</a><div className="dropdown" role="menu"><Link to="/articles">Articles</Link><Link to="/articles#mental-health">Mental Health</Link><Link to="/articles#social-issues">Social Issues</Link><Link to="/quizzes">Quizzes</Link></div></div>
            <div className="nav-item"><a className="nav-link">Library</a><div className="dropdown" role="menu"><Link to="/ebooks">E-books</Link><Link to="/book-club">Book Club</Link><Link to="/book-club#weekly-chapter">Weekly Chapter</Link></div></div>
            <div className="nav-item"><NavLink to="/podcasts" label="Podcasts" active={location.pathname === "/podcasts"} /></div>
            <div className="nav-item"><NavLink to="/training" label="Training" active={location.pathname === "/training"} /></div>
            <div className="nav-item"><a className="nav-link">Community</a><div className="dropdown" role="menu"><Link to="/community">Discussion</Link><Link to="/chatroom">Chatroom</Link><Link to="/quizzes#qa">Q&amp;A</Link></div></div>
            <div className="nav-item"><NavLink to="/consultation" label="Consultation" active={location.pathname === "/consultation"} /></div>
            {authenticated && <div className="nav-item"><NavLink to="/profile" label="Profile" active={location.pathname === "/profile"} /></div>}
          </nav>
          <div className="nav-actions">
            {authenticated ? <button className="btn btn--secondary" type="button" onClick={handleLogout}>Log out</button> : <Link className="btn btn--secondary" to="/login">Login</Link>}
            {!authenticated && <Link className="btn" to="/register">Sign up</Link>}
            <button className="nav-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-panel" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((isOpen) => !isOpen)}><span aria-hidden="true">{menuOpen ? "×" : "☰"}</span></button>
          </div>
        </div>
        <div className={`mobile-panel ${menuOpen ? "is-open" : ""}`} id="mobile-panel"><div className="container mobile-nav"><Link to="/">Home</Link><Link to="/about">About</Link><details><summary>Resources</summary><Link to="/articles">Articles</Link><Link to="/articles#mental-health">Mental Health</Link><Link to="/articles#social-issues">Social Issues</Link><Link to="/quizzes">Quizzes</Link></details><details><summary>Library</summary><Link to="/ebooks">E-books</Link><Link to="/book-club">Book Club</Link><Link to="/book-club#weekly-chapter">Weekly Chapter</Link></details><Link to="/podcasts">Podcasts</Link><Link to="/training">Training</Link><Link to="/community">Community</Link><Link to="/chatroom">Chatroom</Link><Link to="/quizzes#qa">Q&amp;A</Link><Link to="/consultation">Consultation</Link>{authenticated && <Link to="/profile">Profile</Link>}{authenticated ? <button type="button" onClick={handleLogout}>Log out</button> : <Link to="/login">Login</Link>}{!authenticated && <Link to="/register">Sign up</Link>}</div></div>
      </header>
      <Outlet />
      <footer className="site-footer">
        <div className="container footer-grid">
          <div><h4 className="footer-title">Platform</h4><div className="footer-links"><Link to="/about">About</Link><Link to="/consultation">Consultation</Link><Link to="/ai">AI Assistant</Link></div></div>
          <div><h4 className="footer-title">Resources</h4><div className="footer-links"><Link to="/articles#mental-health">Mental Health</Link><Link to="/articles#social-issues">Social Issues</Link><Link to="/quizzes">Quizzes</Link></div></div>
          <div><h4 className="footer-title">Library</h4><div className="footer-links"><Link to="/ebooks">E-books</Link><Link to="/book-club">Book Club</Link><Link to="/library">My Library</Link></div></div>
          <div><h4 className="footer-title">Community</h4><div className="footer-links"><Link to="/community">Discussion</Link><Link to="/chatroom">Chatroom</Link><Link to="/quizzes#qa">Q&amp;A</Link></div></div>
          <div><h4 className="footer-title">Support</h4><div className="footer-links"><Link to="/about">Help Center</Link><Link to="/about">Accessibility</Link><Link to="/about">Contact</Link></div></div>
          <div><h4 className="footer-title">Legal</h4><div className="footer-links"><a href="#">Privacy Policy</a><a href="#">Terms</a></div></div>
        </div>
        <div className="container footer-bottom"><p className="disclaimer">MindfulPath shares educational and support resources. It does not replace professional diagnosis, emergency services, or crisis care.</p><div className="social-list" aria-label="Social links"><a href="#" aria-label="X profile URL placeholder">X</a><a href="#" aria-label="LinkedIn URL placeholder">in</a><a href="#" aria-label="Facebook URL placeholder">f</a><a href="#" aria-label="WhatsApp URL placeholder">wa</a></div>
        </div>
      </footer>
    </>
  );
}
