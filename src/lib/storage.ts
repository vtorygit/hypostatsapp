const ONBOARDING_KEY = "research_toolbox_onboarding_completed";

export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, "true");
}
