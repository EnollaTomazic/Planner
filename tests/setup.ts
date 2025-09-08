import '@testing-library/jest-dom/vitest';

export function resetLocalStorage() {
  window.localStorage.clear();
}
