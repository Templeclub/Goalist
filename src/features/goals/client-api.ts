'use client'

import { HttpError, type Sender } from '@/features/autosave/patch-queue'
import type { GoalPatch } from './api-schema'

async function send(url: string, method: string, body: unknown, keepalive = false) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
    keepalive,
  })
  if (!response.ok) throw new HttpError(response.status)
  return response.json()
}

export function createGoal(body: { id: string; title: string; acceptTerms?: true }) {
  return send('/api/goals', 'POST', body) as Promise<{
    id: string
    version: number
    isFirst: boolean
  }>
}

export function goalSender(goalId: string): Sender<GoalPatch> {
  return (patch, baseVersion, clientMutationId, { keepalive }) =>
    send(`/api/goals/${goalId}`, 'PATCH', { patch, baseVersion, clientMutationId }, keepalive)
}

export const profileSender: Sender<{ displayName?: string | null }> = (
  patch,
  _v,
  _id,
  { keepalive },
) => send('/api/me', 'PATCH', patch, keepalive)
