import { describe, expect, it } from 'vitest'
import { callbackError, isCallbackError } from './callback-error'

describe('callbackError', () => {
  it('explains a Google account that already has its own notebook', () => {
    expect(callbackError('identity_already_exists')).toBe('googleTaken')
  })

  it('explains linking switched off', () => {
    expect(callbackError('manual_linking_disabled')).toBe('googleLinkOff')
  })

  it('falls back to the generic message', () => {
    expect(callbackError(null)).toBe('callback')
    expect(callbackError('flow_state_not_found')).toBe('callback')
  })

  it('only lets known errors through the URL', () => {
    expect(isCallbackError('googleTaken')).toBe(true)
    expect(isCallbackError('<script>')).toBe(false)
  })
})
