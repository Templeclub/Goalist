'use client'

/** Calls a friends API route; resolves to the JSON body, or null when it failed. */
export async function callApi<T = Record<string, unknown>>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T | null> {
  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  }).catch(() => null)
  if (!response?.ok) return null
  return (await response.json().catch(() => ({}))) as T
}
