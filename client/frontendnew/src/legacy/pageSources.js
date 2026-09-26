const publicPages = import.meta.glob("../../pages/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

const adminPages = import.meta.glob("../../admin/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

function getPage(sourceMap, filename) {
  const entry = Object.entries(sourceMap).find(([path]) => path.endsWith(`/${filename}`));
  return entry?.[1] || "";
}

export function getLegacyPage(filename, admin = false) {
  return getPage(admin ? adminPages : publicPages, filename);
}
