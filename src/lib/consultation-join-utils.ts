export function withJoinToken(path: string, joinToken?: string | null) {
  if (!joinToken) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}token=${encodeURIComponent(joinToken)}`;
}
