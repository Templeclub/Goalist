import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { AcceptInvite } from './AcceptInvite'
import { CommentThread } from './CommentThread'
import { FriendCardInteractions } from './FriendCardInteractions'
import { FriendList } from './FriendList'
import { InviteCard } from './InviteCard'
import { OwnCardSocial } from './OwnCardSocial'
import { ShareToggle } from './ShareToggle'

const push = vi.fn()
const refresh = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const goalId = '0192f3a4-7b1c-7d2e-8f3a-123456789abc'
const me = 'b0000000-0000-4000-8000-000000000002'
const click = (name: string | RegExp, role: 'button' | 'radio' = 'button') =>
  act(async () => {
    fireEvent.click(screen.getByRole(role, { name }))
  })

beforeEach(() => {
  push.mockReset()
  refresh.mockReset()
})

describe('InviteCard', () => {
  it('creates the invite link on demand, then offers to copy it', async () => {
    const api = vi
      .fn()
      .mockResolvedValueOnce({ code: null })
      .mockResolvedValueOnce({ code: 'alice-invite-code-0001' })
    renderWithIntl(<InviteCard appName="Boosteur" api={api} />)
    await screen.findByRole('button', { name: 'Créer mon lien d’invitation' })
    await click('Créer mon lien d’invitation')
    expect(api).toHaveBeenLastCalledWith('/api/friends/invite', 'POST')
    expect(screen.getByText(/\/friends\/invite\/alice-invite-code-0001$/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copier le lien' })).toBeInTheDocument()
  })
})

describe('AcceptInvite', () => {
  it('accepts, then opens the friends tab', async () => {
    const api = vi.fn().mockResolvedValue({ friendId: 'x' })
    renderWithIntl(<AcceptInvite code="alice-invite-code-0001" api={api} />)
    await click('Accepter l’invitation')
    expect(api).toHaveBeenCalledWith('/api/friends/accept', 'POST', {
      code: 'alice-invite-code-0001',
    })
    expect(push).toHaveBeenCalledWith('/friends')
  })
})

describe('FriendList', () => {
  it('asks before removing a friend', async () => {
    const api = vi.fn().mockResolvedValue({ ok: true })
    renderWithIntl(
      <FriendList
        api={api}
        friends={[{ id: 'f1', name: 'Alice', since: '2026-11-01T10:00:00Z', sharedCount: 2 }]}
      />,
    )
    expect(screen.getByText(/2 cartes partagées/)).toBeInTheDocument()
    await click(/Retirer Alice/)
    expect(api).not.toHaveBeenCalled()
    expect(screen.getByText(/Retirer Alice de tes amis/)).toBeInTheDocument()
    await click('Retirer')
    expect(api).toHaveBeenCalledWith('/api/friends/f1', 'DELETE')
    await waitFor(() => expect(screen.queryByText('Alice')).not.toBeInTheDocument())
  })
})

describe('FriendCardInteractions', () => {
  const social = {
    reactions: { bravo: 2, courage: 0, inspire: 0 },
    mine: [],
    meToo: false,
    offers: [],
  }

  it('encourages with a count, and takes it back', async () => {
    const api = vi.fn().mockResolvedValue({ ok: true })
    renderWithIntl(
      <FriendCardInteractions goalId={goalId} title="Dormir dehors" social={social} api={api} />,
    )
    await click('Bravo · 2')
    expect(api).toHaveBeenLastCalledWith(`/api/goals/${goalId}/reactions`, 'POST', {
      kind: 'bravo',
    })
    expect(screen.getByRole('button', { name: 'Bravo · 3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await click('Bravo · 3')
    expect(api).toHaveBeenLastCalledWith(`/api/goals/${goalId}/reactions?kind=bravo`, 'DELETE')
  })

  it('says « moi aussi » and copies the card into my deck', async () => {
    const api = vi.fn().mockResolvedValue({ ok: true })
    const copy = vi.fn().mockResolvedValue('new-id')
    renderWithIntl(
      <FriendCardInteractions
        goalId={goalId}
        title="Dormir dehors"
        social={social}
        api={api}
        copy={copy}
      />,
    )
    await click('Moi aussi')
    expect(api).toHaveBeenLastCalledWith(`/api/goals/${goalId}/interest`, 'POST')
    await click('Ajouter à mes cartes')
    expect(copy).toHaveBeenCalledWith('Dormir dehors')
    expect(screen.getByRole('link', { name: 'Voir ma carte' })).toHaveAttribute(
      'href',
      '/goals/new-id',
    )
  })

  it('offers help with a short message', async () => {
    const api = vi.fn().mockResolvedValue({ id: 'o1' })
    renderWithIntl(
      <FriendCardInteractions goalId={goalId} title="Dormir dehors" social={social} api={api} />,
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Je peux aider' }), {
      target: { value: 'Je te prête ma tente' },
    })
    await click('Proposer mon aide')
    expect(api).toHaveBeenLastCalledWith(`/api/goals/${goalId}/offers`, 'POST', {
      message: 'Je te prête ma tente',
    })
    expect(screen.getByRole('status')).toHaveTextContent('Seul ton ami la voit')
  })
})

describe('CommentThread', () => {
  it('sends a message and lets its author remove it', async () => {
    const api = vi.fn().mockResolvedValueOnce({ id: 'c1', createdAt: '2026-11-09T10:00:00Z' })
    renderWithIntl(<CommentThread goalId={goalId} userId={me} initial={[]} api={api} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Ton message' }), {
      target: { value: 'Courage !' },
    })
    await click('Envoyer')
    expect(api).toHaveBeenCalledWith(`/api/goals/${goalId}/comments`, 'POST', { body: 'Courage !' })
    expect(screen.getByText('Courage !')).toBeInTheDocument()
    api.mockResolvedValueOnce({ ok: true })
    await click('Supprimer le message')
    expect(screen.queryByText('Courage !')).not.toBeInTheDocument()
  })
})

describe('ShareToggle', () => {
  it('shares the card with friends', async () => {
    const api = vi.fn().mockResolvedValue({ version: 5 })
    renderWithIntl(<ShareToggle goalId={goalId} version={4} visibility="private" api={api} />)
    expect(screen.getByRole('radio', { name: 'Moi seul' })).toHaveAttribute('aria-checked', 'true')
    await click('Mes amis', 'radio')
    expect(api.mock.calls[0]?.[2]).toMatchObject({
      patch: { visibility: 'circle' },
      baseVersion: 4,
    })
    expect(screen.getByRole('radio', { name: 'Mes amis' })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('OwnCardSocial', () => {
  it('shows encouragements and answers an offer', async () => {
    const api = vi.fn().mockResolvedValue({ ok: true })
    renderWithIntl(
      <OwnCardSocial
        goalId={goalId}
        userId={me}
        api={api}
        social={{
          reactions: { bravo: 1, courage: 0, inspire: 2 },
          mine: [],
          comments: [],
          interestCount: 1,
          interestedNames: ['Bob'],
          meToo: false,
          offers: [
            {
              id: 'o1',
              message: 'Je te prête ma tente',
              status: 'open',
              at: '2026-11-09T10:00:00Z',
              authorId: 'b',
              authorName: 'Bob',
            },
          ],
        }}
      />,
    )
    expect(screen.getByText('Ça m’inspire · 2')).toBeInTheDocument()
    expect(screen.getByText(/1 ami aimerait aussi/)).toBeInTheDocument()
    await click('Accepter')
    expect(api).toHaveBeenCalledWith(`/api/goals/${goalId}/offers/o1`, 'PATCH', {
      status: 'accepted',
    })
    expect(screen.getByText('Acceptée')).toBeInTheDocument()
  })
})
