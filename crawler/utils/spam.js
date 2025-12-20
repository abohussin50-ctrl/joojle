export function isSpam(text) {
  const blacklist = [
    "casino",
    "xxx",
    "free money",
    "spam",
    "adult"
  ];

  const lower = text.toLowerCase();
  return blacklist.some(word => lower.includes(word));
}
