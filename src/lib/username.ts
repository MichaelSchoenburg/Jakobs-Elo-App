const FAKE_EMAIL_DOMAIN = "holdfast-elo.internal";

export function usernameToEmail(username: string): string {
  return `${username.toLowerCase().trim()}@${FAKE_EMAIL_DOMAIN}`;
}
