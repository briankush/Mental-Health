function socialIcon(label) {
  const map = {
    X: "X",
    LinkedIn: "in",
    Facebook: "f",
    WhatsApp: "wa"
  };
  return map[label] || label;
}

export function initFooter({ mountId = "site-footer", basePath = "./" } = {}) {
  const mount = document.getElementById(mountId);
  if (!mount) {
    return;
  }

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h4 class="footer-title">Platform</h4>
          <div class="footer-links">
            <a href="${basePath}pages/about.html">About</a>
            <a href="${basePath}pages/consultation.html">Consultation</a>
            <a href="${basePath}pages/ai.html">AI Assistant</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Resources</h4>
          <div class="footer-links">
            <a href="${basePath}pages/articles.html#mental-health">Mental Health</a>
            <a href="${basePath}pages/articles.html#social-issues">Social Issues</a>
            <a href="${basePath}pages/quizzes.html">Quizzes</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Library</h4>
          <div class="footer-links">
            <a href="${basePath}pages/ebooks.html">E-books</a>
            <a href="${basePath}pages/book-club.html">Book Club</a>
            <a href="${basePath}pages/library.html">My Library</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Community</h4>
          <div class="footer-links">
            <a href="${basePath}pages/community.html">Discussion</a>
            <a href="${basePath}pages/community.html">Chatroom</a>
            <a href="${basePath}pages/quizzes.html#qa">Q&A</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Support</h4>
          <div class="footer-links">
            <a href="${basePath}pages/about.html">Help Center</a>
            <a href="${basePath}pages/about.html">Accessibility</a>
            <a href="${basePath}pages/about.html">Contact</a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Legal</h4>
          <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
      <div class="container footer-bottom">
        <p class="disclaimer">MindfulPath shares educational and support resources. It does not replace professional diagnosis, emergency services, or crisis care.</p>
        <div class="social-list" aria-label="Social links">
          <a href="#" aria-label="X profile URL placeholder">${socialIcon("X")}</a>
          <a href="#" aria-label="LinkedIn URL placeholder">${socialIcon("LinkedIn")}</a>
          <a href="#" aria-label="Facebook URL placeholder">${socialIcon("Facebook")}</a>
          <a href="#" aria-label="WhatsApp URL placeholder">${socialIcon("WhatsApp")}</a>
        </div>
      </div>
    </footer>
  `;
}
