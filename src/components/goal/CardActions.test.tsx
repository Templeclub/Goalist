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
const click = async (name: string | RegExp) =>
  act(async () => {
    fireEvent.click(screen.getByRole('button', { name }))
  })

describe('CardActions', () => {
  it('shows the path and moves the card one step at a time', async () => {
    renderWithIntl(<CardActions goalId={id} version={3} status="idea" />)
    expect(screen.getByText('Étape 1 sur 5')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /convertir la carte/ })).not.toBeInTheDocument()
    await click('Avancer : Confirmée →')
    expect(body(0)).toMatchObject({ patch: { status: 'confirmed' }, baseVersion: 3 })
    expect(refresh).toHaveBeenCalled()
  })

  it('lets you jump to a step of the path', async () => {
    renderWithIntl(<CardActions goalId={id} version={3} status="confirmed" />)
    await click('Passer à l’étape : En préparation')
    expect(body(0)).toMatchObject({ patch: { status: 'preparing' } })
  })

  it('offers to convert only at the last step, then lets you undo it', async () => {
    renderWithIntl(<CardActions goalId={id} version={3} status="in_progress" />)
    await click('C’est fait : convertir la carte ★')
    expect(body(0)).toMatchObject({ patch: { status: 'done' } })
    expect(screen.getByRole('status')).toHaveTextContent('Carte acquise !')
    await click('Annuler la conversion')
    expect(body(1)).toMatchObject({ patch: { status: 'in_progress' }, baseVersion: 4 })
  })

  it('keeps pause and put away as secondary moves', async () => {
    renderWithIntl(<CardActions goalId={id} version={3} status="preparing" />)
    await click('Mettre en pause')
    expect(body(0)).toMatchObject({ patch: { status: 'paused' } })
  })

  it('puts a card away, never destroys it', async () => {
    renderWithIntl(<CardActions goalId={id} version={3} status="idea" />)
    await click('Ranger la carte')
    expect(body(0)).toMatchObject({ patch: { status: 'let_go' } })
    expect(screen.getByRole('status')).toHaveTextContent('Tu peux la ressortir')
  })

  it('resumes a paused card and reopens an acquired one', async () => {
    const { unmount } = renderWithIntl(<CardActions goalId={id} version={3} status="paused" />)
    await click('Reprendre : En cours →')
    expect(body(0)).toMatchObject({ patch: { status: 'in_progress' } })
    unmount()
    renderWithIntl(<CardActions goalId={id} version={5} status="done" />)
    await click('Remettre en cours')
    expect(body(1)).toMatchObject({ patch: { status: 'in_progress' } })
  })
})
