const ONBOARDING_KEY = "research_toolbox_onboarding_completed";
const TOKEN_BALANCE_KEY = "research_toolbox_token_balance";
const TOKEN_RESET_DATE_KEY = "research_toolbox_token_reset_date_msk";

export const DAILY_TOKEN_LIMIT = 100;

export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export function getTokenBalance(): number {
  const raw = localStorage.getItem(TOKEN_BALANCE_KEY);

  if (!raw) {
    return DAILY_TOKEN_LIMIT;
  }

  const value = Number(raw);

  if (Number.isNaN(value)) {
    return DAILY_TOKEN_LIMIT;
  }

  return value;
}

export function setTokenBalance(value: number): void {
  localStorage.setItem(TOKEN_BALANCE_KEY, String(Math.max(0, value)));
}

export function spendTokens(cost: number): boolean {
  const balance = getTokenBalance();

  if (balance < cost) {
    return false;
  }

  setTokenBalance(balance - cost);
  return true;
}

export function getCurrentMoscowDateString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return formatter.format(new Date());
}

export function ensureDailyTokensReset(): void {
  const todayMsk = getCurrentMoscowDateString();
  const lastReset = localStorage.getItem(TOKEN_RESET_DATE_KEY);

  if (lastReset !== todayMsk) {
    localStorage.setItem(TOKEN_RESET_DATE_KEY, todayMsk);
    setTokenBalance(DAILY_TOKEN_LIMIT);
  }
}