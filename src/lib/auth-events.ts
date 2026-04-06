export const AUTH_CHANGED_EVENT = 'qazmarket:auth-changed';

export function notifyAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}
