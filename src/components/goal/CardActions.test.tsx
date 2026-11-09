import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { CardActions } from './CardActions'

const refresh = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh }),
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const id = '0192f3a4-7b1c-7d2e-8f3a-123456789abc'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: 4 }) }),
  )
})
afterEach(() => vi.unstubAllGlobals())

const body = (call: number) =>
  JSON.parse((vi.mocked(fetch).mock.calls[call]?.[1] as RequestInit).body as string)

describe('CardActions', () => {
  it('converts a card, then lets you undo it', async () => {
    renderWithIntl(<CardActions goalId={id} version={3} status="confirmed" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'C’est fait : convertir la carte' }))
    })
    expect(body(0)).toMatchObject({ patch: { status: 'done' }, baseVersion: 3 })
    expect(screen.getByRole('status')).toHaveTextContent('Carte acquise !')
    expect(screen.getByRole('link', { name: 'Voir ma collection' })).toHaveAttribute(
      'href',
      '/collection',
    )
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Annuler la conversion' }))
    })
    expect(body(1)).toMatchObject({ patch: { status: 'confirmed' }, baseVersion: 4 })
    expect(refresh).toHaveBeenCalled()
  })

  it('puts a card away, never destroys it', async () => {
    renderWithIntl(<CardActions goalId={id} version={3} status="idea" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Ranger la carte' }))
    })
    expect(body(0)).toMatchObject({ patch: { status: 'let_go' } })
    expect(screen.getByRole('status')).toHaveTextContent('Tu peux la ressortir')
  })

  it('brings an acquired card back to the deck', async () => {
    renderWithIntl(<CardActions goalId={id} version={3} status="done" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Remettre à convertir' }))
    })
    expect(body(0)).toMatchObject({ patch: { status: 'confirmed' } })
  })
})
