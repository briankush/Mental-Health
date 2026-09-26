import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getLegacyPage } from "../legacy/pageSources.js";
import { runLegacyScripts } from "../legacy/legacyScripts.js";

function extractDocument(html) {
  const documentElement = new DOMParser().parseFromString(html, "text/html");
  return {
    title: documentElement.title,
    body: documentElement.body,
    bodyMarkup: documentElement.body?.innerHTML || "",
    page: documentElement.body?.dataset.page || "",
    base: documentElement.body?.dataset.base || "./",
  };
}

function routeFromLegacyHref(href) {
  if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return null;
  const url = new URL(href, window.location.href);
  const filename = url.pathname.split("/").pop();
  if (filename === "index.html" || filename === "") return `/${url.hash}`;
  if (!filename.endsWith(".html")) return null;
  const route = filename.replace(/\.html$/, "");
  return `/${route}${url.search}${url.hash}`;
}

export function LegacyPage({ filename, admin = false }) {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const html = getLegacyPage(filename, admin);
  const documentData = useMemo(() => extractDocument(html), [html]);

  useEffect(() => {
    document.title = documentData.title || "MindfulPath";
    document.body.dataset.base = documentData.base;
    document.body.dataset.page = documentData.page;
    document.body.className = admin ? "admin-route" : documentData.page === "home" ? "home-page" : "";

    if (admin) {
      import("../legacy/adminStyles.js");
    }

    const root = rootRef.current;
    const handleClick = (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const nextRoute = routeFromLegacyHref(link.getAttribute("href"));
      if (!nextRoute) return;
      event.preventDefault();
      navigate(nextRoute || "/");
    };

    root?.addEventListener("click", handleClick);
    runLegacyScripts(filename, admin);

    return () => {
      root?.removeEventListener("click", handleClick);
      document.body.classList.remove("menu-open");
      document.body.className = "";
    };
  }, [admin, documentData.base, documentData.page, documentData.title, filename, navigate]);

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: documentData.bodyMarkup }} />;
}
