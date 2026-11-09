/** Sign-in page error shown after a failed return from Google, a magic link or a confirmation. */
export type CallbackError = 'callback' | 'googleTaken' | 'googleLinkOff'

export const callbackErrors: readonly CallbackError[] = ['callback', 'googleTaken', 'googleLinkOff']

/**
 * Supabase sends the reason back as `error_code`. Linking Google to a notebook kept without
 * an account fails when that Google account already has its own notebook, or when manual
 * linking is off: in both cases the person can simply sign in with Google instead.
 */
export function callbackError(errorCode: string | null): CallbackError {
  if (errorCode === 'identity_already_exists') return 'googleTaken'
  if (errorCode === 'manual_linking_disabled') return 'googleLinkOff'
  return 'callback'
}

export const isCallbackError = (value: unknown): value is CallbackError =>
  typeof value === 'string' && (callbackErrors as readonly string[]).includes(value)
