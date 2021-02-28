// implement window.getRandomValues(), for packages that rely on it
if (typeof window === "object") {
  if (!window.crypto) window.crypto = {};
}
