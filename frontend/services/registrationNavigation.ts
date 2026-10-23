const REGISTER_ENTRY_KEY = "productosapp:register-entry";
const REGISTER_ENTRY_VALUE = "from-login";

export function markRegistrationNavigation(): void {
  sessionStorage.setItem(REGISTER_ENTRY_KEY, REGISTER_ENTRY_VALUE);
}

export function consumeRegistrationNavigation(): boolean {
  const entry = sessionStorage.getItem(REGISTER_ENTRY_KEY);
  sessionStorage.removeItem(REGISTER_ENTRY_KEY);
  return entry === REGISTER_ENTRY_VALUE;
}

export function clearRegistrationNavigation(): void {
  sessionStorage.removeItem(REGISTER_ENTRY_KEY);
}
