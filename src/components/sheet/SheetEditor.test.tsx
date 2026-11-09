import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { emptySheetExtras } from './fixtures'
import { SheetEditor, type SheetData } from './SheetEditor'

const push = vi.fn()
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  Link: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))
vi.mock('@/lib/supabase/browser', () => ({ getBrowserClient: vi.fn() }))

const data: SheetData = {
  id: '0192f3a4-7b1c-7d2e-8f3a-123456789abc',
  version: 3,
  title: 'Dormir une nuit à la belle étoile',
  emoji: '🏕️',
  status: 'idea',
  descriptionDoc: null,
  why: null,
  firstStep: null,
  valueKeys: [],
  ...emptySheetExtras,
}

const categories = [
  { id: 'c-travel', key: 'travel' as const, label: null, hue: 60 },
  { id: 'c-sport', key: 'sport_health' as const, label: null, hue: 150 },
]

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  localStorage.clear()
  push.mockReset()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('SheetEditor', () => {
  it('has four sections, the first one about the wish itself', () => {
    renderWithIntl(<SheetEditor data={data} section="name" send={vi.fn()} sendValues={vi.fn()} />)
    expect(screen.getByText('L’envie · 1 sur 4')).toBeInTheDocument()
    expect(screen.queryByLabelText(/^Accroche/)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/^Emoji/)).toHaveValue('🏕️')
  })

  it('saves the emoji as you type and never sends an empty title', async () => {
    const send = vi.fn().mockResolvedValue({ version: 4 })
    renderWithIntl(<SheetEditor data={data} section="name" send={send} sendValues={vi.fn()} />)
    fireEvent.change(screen.getByLabelText(/^Emoji/), { target: { value: '🌌' } })
    fireEvent.change(screen.getByRole('textbox', { name: /^Titre/ }), { target: { value: '   ' } })
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0]?.[0]).toEqual({ emoji: '🌌' })
  })

  it('saves the chosen categories in order', async () => {
    const sendCategories = vi.fn().mockResolvedValue({ version: 1 })
    renderWithIntl(
      <SheetEditor
        data={data}
        section="name"
        availableCategories={categories}
        send={vi.fn()}
        sendValues={vi.fn()}
        sendCategories={sendCategories}
      />,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: /Sport & santé/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Voyage/ }))
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(sendCategories.mock.calls.at(-1)?.[0]).toEqual({ ids: ['c-sport', 'c-travel'] })
  })

  it('saves ticked values separately, without a second free-text field', async () => {
    const sendValues = vi.fn().mockResolvedValue({ version: 1 })
    renderWithIntl(<SheetEditor data={data} section="why" send={vi.fn()} sendValues={sendValues} />)
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Liberté' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Partager' }))
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(sendValues.mock.calls.at(-1)?.[0]).toEqual({ keys: ['freedom', 'sharing'] })
  })

  it('gathers what it takes and when on one screen', async () => {
    const send = vi.fn().mockResolvedValue({ version: 4 })
    const sendSmart = vi.fn().mockResolvedValue({ version: 1 })
    renderWithIntl(
      <SheetEditor
        data={data}
        section="smart"
        send={send}
        sendValues={vi.fn()}
        sendSmart={sendSmart}
      />,
    )
    fireEvent.change(screen.getByRole('textbox', { name: /Qu’est-ce qui rend ça possible/ }), {
      target: { value: 'Un duvet chaud' },
    })
    fireEvent.click(screen.getByRole('radio', { name: /Moyen, 3 à 12 mois/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Été' }))
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(sendSmart.mock.calls.at(-1)?.[0]).toEqual({ achievable: 'Un duvet chaud' })
    expect(send.mock.calls.at(-1)?.[0]).toEqual({ horizon: 'medium', seasons: ['summer'] })
  })

  it('ends with the first step and the status, then goes back to the page', async () => {
    const send = vi.fn().mockResolvedValue({ version: 4 })
    renderWithIntl(
      <SheetEditor data={data} section="first-steps" send={send} sendValues={vi.fn()} />,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Envie confirmée' }))
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(send.mock.calls[0]?.[0]).toEqual({ status: 'confirmed' })
    fireEvent.click(screen.getByRole('button', { name: 'Garder et revenir à la page' }))
    await act(() => vi.advanceTimersByTimeAsync(10))
    expect(push).toHaveBeenLastCalledWith(`/goals/${data.id}`)
  })

  it('"Passer pour l’instant" moves on without a snapshot; "Continuer" takes one', async () => {
    const fetchMock = vi.mocked(fetch)
    renderWithIntl(<SheetEditor data={data} section="why" send={vi.fn()} sendValues={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Passer pour l’instant' }))
    await act(() => vi.advanceTimersByTimeAsync(10))
    expect(push).toHaveBeenLastCalledWith(`/goals/${data.id}/edit/smart`)
    expect(fetchMock).not.toHaveBeenCalled()
    fireEvent.click(screen.getAllByRole('button', { name: /Continuer/ })[0]!)
    await act(() => vi.advanceTimersByTimeAsync(10))
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/goals/${data.id}/revisions`,
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
