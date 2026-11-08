import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { CaptureSheet } from './CaptureSheet'

const meta = {
  title: 'Écrans/Capture express',
  component: CaptureSheet,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile' } },
  args: {
    open: true,
    value: '',
    onOpenChange: () => {},
    onValueChange: () => {},
    onKeep: () => {},
  },
} satisfies Meta<typeof CaptureSheet>

export default meta
type Story = StoryObj<typeof meta>

function Interactive(props: Partial<Parameters<typeof CaptureSheet>[0]>) {
  const [value, setValue] = useState(props.value ?? '')
  return (
    <CaptureSheet
      open
      onOpenChange={() => {}}
      onKeep={() => {}}
      {...props}
      value={value}
      onValueChange={setValue}
    />
  )
}

export const Vide: Story = { render: () => <Interactive /> }
export const PremiereEnvie: Story = {
  name: 'Première envie (mention de consentement)',
  render: () => <Interactive value="Dormir une nuit à la belle étoile" showConsent />,
}
export const EnCours: Story = {
  name: 'En train de garder',
  render: () => <Interactive value="Apprendre le violoncelle" busy />,
}
export const Erreur: Story = {
  name: 'Réseau indisponible',
  render: () => (
    <Interactive
      value="Organiser un repas de quartier"
      error="Ton envie n’a pas pu être gardée pour l’instant. Elle reste dans le champ : réessaie dans un instant."
    />
  ),
}
