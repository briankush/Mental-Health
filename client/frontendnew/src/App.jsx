import { Navigate, Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { AboutPage } from "./pages/AboutPage.jsx";
import { ConsultationPage } from "./pages/ConsultationPage.jsx";
import { LegacyPage } from "./pages/LegacyPage.jsx";

const publicRoutes = [
  ["/articles", "articles.html"],
  ["/article", "article.html"],
  ["/ebooks", "ebooks.html"],
  ["/ebook", "ebook.html"],
  ["/podcasts", "podcasts.html"],
  ["/podcast", "podcast.html"],
  ["/book-club", "book-club.html"],
  ["/community", "community.html"],
  ["/chatroom", "chatroom.html"],
  ["/ai", "ai.html"],
  ["/quizzes", "quizzes.html"],
  ["/training", "training.html"],
  ["/library", "library.html"],
  ["/profile", "profile.html"],
  ["/login", "login.html"],
  ["/register", "register.html"],
  ["/forgot-password", "forgot-password.html"],
];

const adminRoutes = [
  ["/admin", "index.html"],
  ["/admin/articles", "articles.html"],
  ["/admin/books", "books.html"],
  ["/admin/podcasts", "podcasts.html"],
  ["/admin/users", "users.html"],
  ["/admin/moderation", "moderation.html"],
  ["/admin/settings", "settings.html"],
  ["/admin/advertisements", "advertisements.html"],
  ["/admin/appointments", "appointments.html"],
  ["/admin/book-club", "book-club.html"],
  ["/admin/payments", "payments.html"],
  ["/admin/quizzes", "quizzes.html"],
  ["/admin/reports", "reports.html"],
  ["/admin/training", "training.html"],
];

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="consultation" element={<ConsultationPage />} />
      </Route>
      {publicRoutes.map(([path, filename]) => (
        <Route key={path} path={path} element={<LegacyPage filename={filename} />} />
      ))}
      {adminRoutes.map(([path, filename]) => (
        <Route key={path} path={path} element={<LegacyPage filename={filename} admin />} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
