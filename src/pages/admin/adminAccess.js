const ADMIN_ACCESS_USERS = [
  { username: "admin", email: "admin@aashaka.com" },
];

const normalize = (value) => String(value || "").trim().toLowerCase();

export const hasAdminAccess = (user) => {
  if (!user) return false;

  const userEmail = normalize(user.id || user.email);
  const userName = normalize(user.username || user.name || userEmail.split("@")[0]);

  return ADMIN_ACCESS_USERS.some(
    (entry) =>
      normalize(entry.email) === userEmail && normalize(entry.username) === userName
  );
};

export default ADMIN_ACCESS_USERS;
