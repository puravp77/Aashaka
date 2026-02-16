const isAbsoluteUrl = (value) => /^([a-z][a-z0-9+.-]*:)?\/\//i.test(value);

export const withPublicUrl = (path) => {
  if (!path) return path;
  if (isAbsoluteUrl(path) || path.startsWith("data:")) return path;
  const base = process.env.PUBLIC_URL || "";
  if (base && (path === base || path.startsWith(`${base}/`))) return path;
  const normalized = path.replace(/^\/+/, "");
  if (!base) return path.startsWith("/") ? path : `/${normalized}`;
  return `${base}/${normalized}`;
};

export const mapImageList = (images) =>
  Array.isArray(images) ? images.map(withPublicUrl) : images;
