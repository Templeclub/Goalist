import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithIntl } from '@/test/render'
import { SignInForm } from './SignInForm'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const noop = async () => {}

describe('SignInForm', () => {
  it('says gently when the address looks incomplete', async () => {
    const user = userEvent.setup()
    const onMagicLink = vi.fn(noop)
    renderWithIntl(
      <SignInForm
        converting={false}
        onMagicLink={onMagicLink}
        onGoogle={noop}
        onPassword={async () => 'done'}
      />,
    )
    await user.type(screen.getByLabelText('Ton adresse e-mail'), 'camille@')
    await user.click(screen.getByRole('button', { name: 'Recevoir le lien' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Cette adresse ne semble pas complète.')
    expect(onMagicLink).not.toHaveBeenCalled()
  })

  it('confirms the link was sent', async () => {
    const user = userEvent.setup()
    renderWithIntl(
      <SignInForm
        converting={false}
        onMagicLink={noop}
        onGoogle={noop}
        onPassword={async () => 'done'}
      />,
    )
    await user.type(screen.getByLabelText('Ton adresse e-mail'), 'camille@exemple.fr')
    await user.click(screen.getByRole('button', { name: 'Recevoir le lien' }))
    expect(await screen.findByText('Regarde ta boîte mail')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Renvoyer le lien dans/ })).toBeDisabled()
  })

  it('maps refused credentials to a kind message', async () => {
    const user = userEvent.setup()
    renderWithIntl(
      <SignInForm
        converting={false}
        onMagicLink={noop}
        onGoogle={noop}
        onPassword={async () => {
          throw new Error('credentials')
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Utiliser un mot de passe' }))
    await user.type(screen.getByLabelText('Ton adresse e-mail'), 'camille@exemple.fr')
    await user.type(screen.getByLabelText('Mot de passe'), 'un-long-mot-de-passe')
    await user.click(screen.getByRole('button', { name: 'Me connecter' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cette combinaison ne fonctionne pas.',
    )
  })
})
