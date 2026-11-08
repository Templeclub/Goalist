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
  tagline: null,
  emoji: null,
  hue: null,
  categories: [],
  status: 'idea',
  descriptionDoc: null,
  imaginedOutcome: null,
  whereWith: null,
  why: null,
  benefits: null,
  firstStep: null,
  notes: null,
  valueKeys: [],
  customValues: [],
  media: [],
  ...emptySheetExtras,
}

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
  it('saves the tagline as you type and never sends an empty title', async () => {
    const send = vi.fn().mockResolvedValue({ version: 4 })
    renderWithIntl(
      <SheetEditor data={data} section="name" canUploadImages send={send} sendValues={vi.fn()} />,
    )
    fireEvent.change(screen.getByLabelText(/^Accroche/), {
      target: { value: 'Voir la Voie lactée' },
    })
    fireEvent.change(screen.getByLabelText(/^Titre/), { target: { value: '   ' } })
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0]?.[0]).toEqual({ tagline: 'Voir la Voie lactée' })
  })

  it('saves ticked values separately', async () => {
    const sendValues = vi.fn().mockResolvedValue({ version: 1 })
    renderWithIntl(
      <SheetEditor
        data={data}
        section="why"
        canUploadImages
        send={vi.fn()}
        sendValues={sendValues}
      />,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Liberté' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Partager' }))
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(sendValues.mock.calls.at(-1)?.[0]).toEqual({ keys: ['freedom', 'sharing'] })
  })

  it('keeps sharing closed while offering the status choice', async () => {
    const send = vi.fn().mockResolvedValue({ version: 4 })
    renderWithIntl(
      <SheetEditor data={data} section="review" canUploadImages send={send} sendValues={vi.fn()} />,
    )
    expect(screen.getByRole('radio', { name: /Communauté/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: 'Envie confirmée' }))
    await act(() => vi.advanceTimersByTimeAsync(800))
    expect(send.mock.calls[0]?.[0]).toEqual({ status: 'confirmed' })
  })

  it('"Passer pour l’instant" moves on without a snapshot; "Continuer" takes one', async () => {
    const fetchMock = vi.mocked(fetch)
    renderWithIntl(
      <SheetEditor
        data={data}
        section="first-steps"
        canUploadImages
        send={vi.fn()}
        sendValues={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Passer pour l’instant' }))
    await act(() => vi.advanceTimersByTimeAsync(10))
    expect(push).toHaveBeenLastCalledWith(`/goals/${data.id}/edit/review`)
    expect(fetchMock).not.toHaveBeenCalled()
    fireEvent.click(screen.getAllByRole('button', { name: /Continuer/ })[0]!)
    await act(() => vi.advanceTimersByTimeAsync(10))
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/goals/${data.id}/revisions`,
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('offers images only to notebooks with an account', () => {
    renderWithIntl(
      <SheetEditor
        data={data}
        section="describe"
        canUploadImages={false}
        send={vi.fn()}
        sendValues={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Ajouter une image' })).not.toBeInTheDocument()
    expect(screen.getByText(/disponibles une fois ton carnet relié/)).toBeInTheDocument()
  })
})
